const express = require('express');
const Booking = require('./models/Booking');
const Property = require('./models/property');
const User = require('./models/User');

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
  try {
    const bookings = await Booking.find({ property: req.params.id })
      .populate('user');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;