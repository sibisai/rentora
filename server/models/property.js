const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
      // For Maps SDK - Uncomment if needed:
      // latitude: { type: Number },
      // longitude: { type: Number },
    },
    price: { type: Number, required: true },
    images: [{ type: String }],       // Optional array of image URLs
    amenities: [{ type: String }],      // Optional array of amenities
    propertyType: { type: String, required: true },
    rooms: { type: Number, required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional reference to User model
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);