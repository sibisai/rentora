const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Username field is removed
  email: {
    type: String,
    required: [true, 'Email is required.'], // Added custom message
    unique: true, // Ensure emails are unique
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please provide a valid email address.'] // Basic format validation
  },
  password: {
    type: String,
    required: [true, 'Password is required.']
  },
  host: { type: Boolean, default: true }
  // Add any other user fields if needed later
}, { timestamps: true });

// --- Password Hashing Middleware (Stays the same) ---
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);