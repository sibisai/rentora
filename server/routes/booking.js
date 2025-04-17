const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/property');
const User = require('../models/User');

const router = express.Router();

// Create a booking
router.post('/bookings', async (req, res) => {
  try {
    const { propertyId, userId, startDate, endDate } = req.body;

    // Validate inputs
    if (!propertyId || !userId || !startDate || !endDate) {
      return res.status(400).json({ message: 'All booking details are required.' });
    }

    // Verify property and user exist
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 1. endDate must be after startDate
    if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return res.status(400).json({ error: 'endDate must be after startDate' });
    }

    // 2. prevent overlapping bookings for the same property
    const clash = await Booking.findOne({
      property: req.body.propertyId,
      startDate: { $lt: req.body.endDate },
      endDate:   { $gt: req.body.startDate },
    });
    if (clash) {
      return res.status(409).json({ error: 'Dates overlap an existing booking' });
    }

    // Create a new booking
    const newBooking = new Booking({
      property: propertyId,
      user: userId,
      startDate,
      endDate
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve all bookings (optionally filter by user or property)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('property')
      .populate('user'); // Optionally populate to get details
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve bookings for a specific property
router.get('/properties/:id/bookings', async (req, res) => {
  const propertyId = req.params.id;

  // 1. Validate Property ID Format
  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    // If the ID format is invalid, it's a client error (Bad Request)
    return res.status(400).json({ message: 'Invalid property ID format.' });
  }

  try {
    // 2. Check if the Property Actually Exists
    const property = await Property.findById(propertyId);
    if (!property) {
      // If the property is not found (valid ID format, but no match), return 404
      return res.status(404).json({ message: 'Property not found.' });
    }

    // 3. Property exists, now find its associated bookings
    const bookings = await Booking.find({ property: propertyId })
      .populate('user'); // Continue populating user if needed

    // 4. Return the found bookings (will be [] if none, which is correct)
    res.status(200).json(bookings);

  } catch (err) {
    // 5. Handle other unexpected errors (e.g., database connection issue)
    console.error("Error fetching bookings for property:", propertyId, err); // Log for debugging
    res.status(500).json({ message: 'An error occurred while retrieving bookings.' });
  }
});


module.exports = router;