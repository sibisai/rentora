require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
// const fetch = require('node-fetch'); // Uncomment this line if using Node < 18

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS Configuration ---
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
    origin: frontendURL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// --- MongoDB Connection ---
const uri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_URI_TEST
  : process.env.MONGO_URI;
  mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB using:", uri))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());

// --- Import Models ---
const Property = require('./models/property');
const Booking = require('./models/Booking');

// --- Geocoding Function (using Nominatim) ---
async function getCoordinatesForAddress(locationData) {
  // Skip geocoding in test environment to avoid external API calls
  if (process.env.NODE_ENV === 'test') {
    console.log("Test environment detected, using default coordinates");
    return { longitude: 0, latitude: 0 };
  }

  // Construct a query string - be specific for better results
  const { address, city, state, zip, country } = locationData;
  // Basic address format - adjust if needed based on your data quality
  const queryString = `${address || ''}, ${city || ''}, ${state || ''} ${zip || ''}, ${country || ''}`.trim().replace(/^,|,$/g, ''); // Clean up string

  if (!queryString || queryString === ',') {
      console.warn("Geocoding skipped: Insufficient address details provided.");
      return null; // Not enough info to geocode
  }

  const encodedQuery = encodeURIComponent(queryString);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`; // Limit to 1 result

  console.log(`Geocoding query: ${queryString}`);
  console.log(`Requesting URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // TO-DO: Set a descriptive User-Agent per Nominatim policy
        'User-Agent': 'YourAppName/1.0 (Contact: your-email@example.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const longitude = parseFloat(result.lon);
      const latitude = parseFloat(result.lat);

      if (!isNaN(longitude) && !isNaN(latitude)) {
         console.log(`Geocoding successful: [${longitude}, ${latitude}]`);
        return { longitude, latitude };
      } else {
         console.warn("Geocoding failed: Invalid coordinates received from Nominatim.", result);
         return null;
      }
    } else {
      console.warn("Geocoding failed: No results found for address.");
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null; // Indicate failure
  }
}


// ========================================================
//               PROPERTY ROUTES
// ========================================================

// --- CREATE Property (with Geocoding) ---
app.post('/properties', async (req, res) => {
  try {
    // --- Geocoding Step ---
    if (!req.body.location) {
        return res.status(400).json({ error: "Location data is required." });
    }

    const coordinates = await getCoordinatesForAddress(req.body.location);

    if (coordinates) {
      // Add coordinates to the request body before validation/saving
      req.body.location.coordinates = {
        type: 'Point',
        coordinates: [coordinates.longitude, coordinates.latitude] // LONGITUDE FIRST!
      };
    } else {
      // In test environment, use default coordinates even if geocoding fails
      if (process.env.NODE_ENV === 'test') {
        req.body.location.coordinates = {
          type: 'Point',
          coordinates: [0, 0]
        };
      } else {
        // Handle geocoding failure - return error as coordinates are required by schema
        console.warn("Property creation failed due to geocoding failure for:", req.body.title);
        return res.status(400).json({ error: "Could not determine coordinates for the provided address. Please check the address details." });
      }
    }
    // --- End Geocoding Step ---

    const newProperty = new Property(req.body);
    await newProperty.save(); // Mongoose validation runs here
    res.status(201).json(newProperty);

  } catch (err) {
     if (err.name === 'ValidationError') {
        // If validation fails (e.g., missing required fields AFTER geocoding attempt)
        return res.status(400).json({ error: "Validation Error", details: err.message });
     }
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Failed to create property", details: err.message });
  }
});

// --- READ Properties (with Advanced Filtering) ---
app.get('/properties', async (req, res) => {
  try {
    // Destructure all potential query parameters
    const {
      latitude, longitude, radius,
      checkIn, checkOut,
      minPrice, maxPrice,
      propertyType,
      // Add other potential filters like guests, rooms, amenities here
    } = req.query;

    const query = {}; // Base query object

    // --- 1. Availability Filter (Check-in/Check-out) ---
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
        return res.status(400).json({ error: 'Invalid check-in or check-out dates provided.' });
      }

      const conflictingBookings = await Booking.find({
        startDate: { $lt: checkOutDate },
        endDate: { $gt: checkInDate }
      }).select('property');

      const bookedPropertyIds = [...new Set(conflictingBookings.map(booking => booking.property.toString()))];
      query._id = { $nin: bookedPropertyIds };
      console.log(`Filtering out ${bookedPropertyIds.length} booked properties.`);
    }

    // --- 2. Geospatial Filter (Latitude/Longitude/Radius) ---
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const searchRadiusMiles = parseFloat(radius || '25'); // Default 25 miles
      const radiusInMeters = searchRadiusMiles * 1609.34;

      if (!isNaN(lat) && !isNaN(lon) && radiusInMeters > 0) {
        query['location.coordinates'] = {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [lon, lat] }, // Longitude first!
            $maxDistance: radiusInMeters
          }
        };
        console.log(`Applying geospatial filter: radius <span class="math-inline">\{searchRadiusMiles\} miles around \[</span>{lon}, ${lat}]`);
      } else {
        console.warn("Ignoring invalid latitude/longitude/radius for search.");
      }
    }

    // --- 3. Price Filter ---
    const priceFilter = {};
    const parsedMinPrice = parseFloat(minPrice);
    const parsedMaxPrice = parseFloat(maxPrice);
    if (!isNaN(parsedMinPrice) && parsedMinPrice >= 0) {
      priceFilter.$gte = parsedMinPrice;
    }
    if (!isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
      if (priceFilter.$gte === undefined || parsedMaxPrice >= priceFilter.$gte) {
        priceFilter.$lte = parsedMaxPrice;
      } else {
         console.warn(`Max price ${parsedMaxPrice} ignored because it's less than min price ${priceFilter.$gte}.`)
      }
    }
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
      console.log("Applying price filter:", priceFilter);
    }

    // --- 4. Property Type Filter ---
    if (propertyType && propertyType !== 'Any' && propertyType !== '') {
      query.propertyType = propertyType;
      console.log("Applying property type filter:", propertyType);
    }

    // --- Add other filters here ---
    // Example:
    // if (req.query.minRooms) query.rooms = { $gte: parseInt(req.query.minRooms) };

    console.log("Final MongoDB Query:", JSON.stringify(query, null, 2));
    const properties = await Property.find(query); // Execute query
    console.log(`Found ${properties.length} properties matching criteria.`);
    res.json(properties);

  } catch (err) {
    console.error("Error searching properties:", err);
    res.status(500).json({ error: 'Failed to search properties', details: err.message });
  }
});

// --- READ Specific Property by ID  ---
app.get('/properties/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid property ID format' });
  }
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: 'Failed to fetch property', details: err.message });
  }
});

// --- UPDATE Property (with Geocoding if location changes) ---
app.put('/properties/:id', async (req, res) => {
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
       return res.status(400).json({ error: 'Invalid property ID format' });
    }
  try {
    const propertyToUpdate = await Property.findById(req.params.id);
    if (!propertyToUpdate) {
       return res.status(404).json({ error: 'Property not found' });
    }

    // --- Geocoding Step (Only if location data is provided in the update) ---
    let needsGeocoding = false;
    if (req.body.location) {
        // Check if any relevant address component has changed
        const oldLoc = propertyToUpdate.location;
        const newLoc = req.body.location;
        if (
            (newLoc.address && newLoc.address !== oldLoc.address) ||
            (newLoc.city && newLoc.city !== oldLoc.city) ||
            (newLoc.state && newLoc.state !== oldLoc.state) ||
            (newLoc.zip && newLoc.zip !== oldLoc.zip) ||
            (newLoc.country && newLoc.country !== oldLoc.country)
        ) {
           needsGeocoding = true;
           console.log("Address change detected, attempting geocoding for update.");
        }
    }

    if (needsGeocoding) {
        // Construct location object for geocoder using new data merged with old if necessary
        const locationForGeocoding = {
            address: req.body.location.address ?? propertyToUpdate.location.address,
            city:    req.body.location.city ?? propertyToUpdate.location.city,
            state:   req.body.location.state ?? propertyToUpdate.location.state,
            zip:     req.body.location.zip ?? propertyToUpdate.location.zip,
            country: req.body.location.country ?? propertyToUpdate.location.country,
        };

        const coordinates = await getCoordinatesForAddress(locationForGeocoding);

        if (coordinates) {
            // Ensure req.body.location exists before assigning to it
            req.body.location = req.body.location || {};
            req.body.location.coordinates = {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude]
            };
        } else {
            // In test environment, use default coordinates even if geocoding fails
            if (process.env.NODE_ENV === 'test') {
              req.body.location.coordinates = {
                type: 'Point',
                coordinates: [0, 0]
              };
            } else {
              // Geocoding failed - return error
              console.warn(`Property update failed (ID: ${req.params.id}) due to geocoding failure.`);
              return res.status(400).json({ error: "Could not determine coordinates for the updated address. Please check address details." });
            }
        }
    }
    // --- End Geocoding Step ---

    // Perform the update using the (potentially modified) req.body
    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true // Run schema validation on the update
    });

    // findByIdAndUpdate returns null if not found, even if checked before (edge case)
    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found during update.' });
    }

    res.json(updatedProperty);

  } catch (err) {
     if (err.name === 'ValidationError') {
        return res.status(400).json({ error: "Validation Error", details: err.message });
     }
    console.error(`Error updating property ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update property', details: err.message });
  }
});

// Delete a property by ID
app.delete('/properties/:id', async (req, res) => {
  // Validation
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property ID format' });
  }
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    // Might need to deleting associated bookings here too
    // await Booking.deleteMany({ property: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ error: 'Failed to delete property', details: err.message });
  }
});

// --- Mount Auth Routes ---
const authRoutes = require('./auth');
app.use('/auth', authRoutes);

// --- Mount Booking Routes ---
const bookingRoutes = require('./booking');
app.use('/', bookingRoutes);

// --- Mount Upload Routes ---
const uploadRoute = require('./imageUpload');
app.use('/image', uploadRoute);

// --- Basic Not Found Handler ---
app.use((req, res, next) => {
    res.status(404).json({ error: "Not Found" });
});

// --- General Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

module.exports = app;
