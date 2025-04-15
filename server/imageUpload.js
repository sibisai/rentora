const express = require('express');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3-v3');  // Note the changed package name
require('dotenv').config();

const app = express();

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

// Define a POST route to upload an image
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    imageUrl: req.file.location, // S3 returns the file URL here
    message: 'Image uploaded successfully!',
  });
});

app.listen(3001, () => console.log("Server running on port 3001"));