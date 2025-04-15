const mongoose = require('mongoose');

// Define the GeoJSON schema for location coordinates
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0],
    required: true
  }
});

// Define the location schema
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    type: pointSchema,
    default: () => ({ type: 'Point', coordinates: [0, 0] })
  }
});

// Define the property schema
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { 
    type: locationSchema, 
    required: true 
  },
  price: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  amenities: { type: [String], default: [] },
  propertyType: { 
    type: String, 
    required: true,
    enum: ['House', 'Apartment', 'Cabin', 'Studio', 'Villa', 'Townhouse', 'Condo', 'Loft', 'Mansion', 'Other'],
  },
  rooms: { type: Number, required: true, min: 1 },
  hostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  }
}, { timestamps: true });

// Create a 2dsphere index on the location.coordinates field for geospatial queries
propertySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
