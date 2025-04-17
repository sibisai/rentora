const express = require('express');
const bcrypt = require('bcrypt'); // Using bcrypt consistent with schema hook
const jwt = require('jsonwebtoken'); // For generating JWTs
const User = require('../models/User');
const router = express.Router();

// --- Signup Endpoint ---
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
     // Add password complexity validation if desired here

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Use 409 Conflict for existing resource
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Create new user - Hashing is handled by the pre-save hook in userSchema
    const newUser = new User({
        email,
        password // Pass plain password, hook will hash it
    });

    // Save the user (triggers the pre-save hook)
    const savedUser = await newUser.save();

    // Respond with essential user info (excluding password)
    res.status(201).json({
        message: 'User created successfully',
        userId: savedUser._id, // Return the user ID
        email: savedUser.email
    });

  } catch (err) {
     if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Validation Error", details: err.errors });
     }
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});

// --- Login Endpoint ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Generic message for security (don't reveal if email exists)
      return res.status(401).json({ message: 'Invalid email or password.' }); // Use 401 Unauthorized
    }

    // Compare submitted password with hashed password in DB
    // Assumes user model has a comparePassword method as shown previously
    const isValid = await user.comparePassword(password); // Use the method from the schema
    // Or directly if method not defined: const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Use 401 Unauthorized
    }

    // --- Credentials are valid, generate JWT ---
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET environment variable not set!");
        return res.status(500).json({ message: "Server configuration error." });
    }

    // Create JWT payload
    const payload = {
      userId: user._id,
      email: user.email // Include other non-sensitive info if needed
    };

    // Sign the token
    const token = jwt.sign(
        payload,
        jwtSecret,
        { expiresIn: '1h' } // Token expiration time (e.g., 1 hour, 7d, etc.)
    );

    // Send token (and optionally user info) back to client
    res.status(200).json({
        message: 'Login successful',
        token: token,
        userId: user._id, // Often useful for frontend
        email: user.email
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// --- Authentication Middleware ---
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const { userId, email } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: userId, email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  router,
  authenticate
};