const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/property');
const Booking = require('../models/booking');

const router = express.Router();

// --- Geocoding helper (same as before) ---
async function getCoordinatesForAddress(locationData) {
  if (process.env.NODE_ENV === 'test') {
    console.log("Test environment detected, using default coordinates");
    return { longitude: 0, latitude: 0 };
  }

  const { address, city, state, zip, country } = locationData;
  const queryString = `${address||''}, ${city||''}, ${state||''} ${zip||''}, ${country||''}`
    .trim().replace(/^,|,$/g, '');
  if (!queryString || queryString === ',') {
    console.warn("Geocoding skipped: Insufficient address details provided.");
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json`
    + `&q=${encodeURIComponent(queryString)}&limit=1`;

  console.log(`Geocoding query: ${queryString}`);
  console.log(`Requesting URL: ${url}`);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (Contact: your-email@example.com)',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Nominatim request failed with status ${res.status}`);
    const data = await res.json();
    if (!data.length) {
      console.warn("Geocoding failed: No results found for address.");
      return null;
    }
    const { lon, lat } = data[0];
    const longitude = parseFloat(lon), latitude = parseFloat(lat);
    if (isNaN(longitude) || isNaN(latitude)) {
      console.warn("Geocoding failed: Invalid coordinates received from Nominatim.", data[0]);
      return null;
    }
    console.log(`Geocoding successful: [${longitude}, ${latitude}]`);
    return { longitude, latitude };
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return null;
  }
}

// CREATE
router.post('/', async (req, res) => {
  if (req.user?.id) req.body.hostId = req.user.id;
  if (!req.body.location) {
    return res.status(400).json({ error: "Location data is required." });
  }
  try {
    const coords = await getCoordinatesForAddress(req.body.location);
    if (coords) {
      req.body.location.coordinates = {
        type: 'Point',
        coordinates: [coords.longitude, coords.latitude]
      };
    } else if (process.env.NODE_ENV === 'test') {
      req.body.location.coordinates = { type: 'Point', coordinates: [0, 0] };
    } else {
      console.warn("Property creation failed due to geocoding failure for:", req.body.title);
      return res.status(400).json({
        error: "Could not determine coordinates for the provided address. Please check the address details."
      });
    }
    const p = new Property(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation Error", details: err.message });
    }
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Failed to create property", details: err.message });
  }
});

// READ ALL (with filters)
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, radius, checkIn, checkOut, minPrice, maxPrice, propertyType } = req.query;
    const query = {};

    // Availability
    if (checkIn && checkOut) {
      const inD = new Date(checkIn), outD = new Date(checkOut);
      if (isNaN(inD)||isNaN(outD)||outD<=inD) {
        return res.status(400).json({ error: 'Invalid check-in or check-out dates provided.' });
      }
      const booked = await Booking.find({ startDate:{ $lt: outD }, endDate:{ $gt: inD } }).select('property');
      const ids = [...new Set(booked.map(b=>b.property.toString()))];
      query._id = { $nin: ids };
    }

    // Geo
    if (latitude && longitude) {
      const lat = parseFloat(latitude), lon = parseFloat(longitude);
      const miles = parseFloat(radius||'25')*1609.34;
      if (!isNaN(lat)&&!isNaN(lon)&&miles>0) {
        query['location.coordinates'] = {
          $nearSphere: { $geometry:{ type:'Point', coordinates:[lon,lat] }, $maxDistance:miles }
        };
      }
    }

    // Price
    const price = {};
    if (!isNaN(parseFloat(minPrice))) price.$gte = parseFloat(minPrice);
    if (!isNaN(parseFloat(maxPrice)) && (price.$gte===undefined||parseFloat(maxPrice)>=price.$gte)) {
      price.$lte = parseFloat(maxPrice);
    }
    if (Object.keys(price).length) query.price = price;

    // Type
    if (propertyType && propertyType!=='Any') {
      query.propertyType = propertyType;
    }

    const props = await Property.find(query);
    res.json(props);
  } catch (err) {
    console.error("Error searching properties:", err);
    res.status(500).json({ error: 'Failed to search properties', details: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid property ID format' });
  }
  try {
    const p = await Property.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Property not found' });
    res.json(p);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: 'Failed to fetch property', details: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid property ID format' });
  }
  try {
    const existing = await Property.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Property not found' });

    let needsGeo = false;
    if (req.body.location) {
      ['address','city','state','zip','country'].forEach(fld => {
        if (req.body.location[fld] && req.body.location[fld] !== existing.location[fld]) {
          needsGeo = true;
        }
      });
    }
    if (needsGeo) {
      console.log("Address change detected, attempting geocoding for update.");
      const geoData = await getCoordinatesForAddress({
        ...existing.location, ...req.body.location
      });
      if (geoData) {
        req.body.location = req.body.location||{};
        req.body.location.coordinates = {
          type:'Point',
          coordinates:[geoData.longitude, geoData.latitude]
        };
      } else if (process.env.NODE_ENV!=='test') {
        console.warn(`Property update failed (${req.params.id}) due to geocoding failure.`);
        return res.status(400).json({
          error: "Could not determine coordinates for the updated address. Please check address details."
        });
      } else {
        req.body.location = req.body.location||{};
        req.body.location.coordinates = { type:'Point', coordinates:[0,0] };
      }
    }

    if (req.user?.id) req.body.hostId = req.user.id;
    const updated = await Property.findByIdAndUpdate(
      req.params.id, req.body,
      { new:true, runValidators:true }
    );
    if (!updated) return res.status(404).json({ error:'Property not found during update.' });
    res.json(updated);
  } catch (err) {
    if (err.name==='ValidationError') {
      return res.status(400).json({ error:'Validation Error', details:err.message });
    }
    console.error(`Error updating property ${req.params.id}:`, err);
    res.status(500).json({ error:'Failed to update property', details:err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error:'Invalid property ID format' });
  }
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error:'Property not found' });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ error:'Failed to delete property', details:err.message });
  }
});

module.exports = router;