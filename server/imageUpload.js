const express = require('express');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3-v3');
const mongoose = require('mongoose');
const Property = require('./models/property');
require('dotenv').config();

const router = express.Router();

// Configure the S3 client (AWS SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up Multer storage using multer-s3-v3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// This route uploads an image and then updates the property with the new image URL.
router.post('/upload/:propertyId', upload.single('image'), async (req, res) => {
  const propertyId = req.params.propertyId;
  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Invalid property ID format' });
  }

  if (!req.file || !req.file.location) {
    return res.status(400).json({ error: 'Image upload failed, no file received.' });
  }

  try {
    const imageUrl = req.file.location;
    
    // Update the property: push the new image URL into the images array
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $push: { images: imageUrl } },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    res.json({
      message: 'Image uploaded and property updated successfully.',
      property: updatedProperty,
    });
  } catch (err) {
    console.error('Error updating property with image: ', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;