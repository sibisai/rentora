require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { router: authRoutes, authenticate } = require('./routes/auth');
const bookingRoutes  = require('./routes/booking');
const uploadRoute   = require('./routes/imageUpload');
const propertyRoutes = require('./routes/property');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE'],
}));

// DB
mongoose.connect(
  process.env.NODE_ENV==='test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI
).then(() => console.log("Connected to MongoDB"))
 .catch(err => console.error("MongoDB error:", err));

// JSON
app.use(express.json());

// Auth
app.use('/auth', authRoutes);

// Properties (no auth in test/ci; auth in prod)
if (process.env.NODE_ENV === 'production') {
  app.use('/properties', authenticate, propertyRoutes);
} else {
  app.use('/properties', propertyRoutes);
}

// Bookings & Image upload
app.use('/', bookingRoutes);
app.use('/image', uploadRoute);

if (process.env.NODE_ENV !== 'test') {
  // --- Basic Not Found Handler ---
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // --- General Error Handler ---
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  });
}

module.exports = app;