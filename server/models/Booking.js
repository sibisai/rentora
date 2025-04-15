const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, { timestamps: true });
bookingSchema.index({ property: 1, startDate: 1, endDate: 1 });
module.exports = mongoose.model('Booking', bookingSchema);