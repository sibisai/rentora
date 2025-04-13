const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // Add additional fields like location, price, images, amenities, etc.
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);