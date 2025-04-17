// upload.test.js
const request = require('supertest'); // Using supertest for easier HTTP request simulation
const express = require('express');
const mongoose = require('mongoose');


const Property = require('../models/Property');
const uploadRouter = require('../routes/imageUpload');

// Mock the Property model
jest.mock('../models/property'); 

// Mock mongoose ObjectId validation
const mockIsValidObjectId = jest.fn();
mongoose.Types.ObjectId.isValid = mockIsValidObjectId;

// --- Mock Multer Setup (Fixing ReferenceError - Definitive Fix) ---

// Mock the core 'multer' module *defining the implementation inline*
jest.mock('multer', () => {
  // This is the function that gets called when `require('multer')` is executed.
  const multerFn = () => ({
    // This is the object returned by `multer()`.
    single: jest.fn().mockImplementation((fieldName) => {
      // This function is the mock middleware
      return (req, res, next) => {

        if (req.simulateMulterError) {
          next(new Error(req.simulateMulterError));
        } else if (req.simulateNoFile) {
          req.file = undefined;
          next();
        } else {
          // Simulate successful upload
          req.file = {
            fieldname: fieldName,
            originalname: 'test-image.jpg',
            mimetype: 'image/jpeg',
            size: 12345,
            bucket: 'test-bucket',
            key: `mock-${Date.now()}-test-image.jpg`,
            location: `https://test-bucket.s3.us-east-1.amazonaws.com/mock-${Date.now()}-test-image.jpg`,
          };
          next();
        }
      };
    }), // End of single mock implementation
    // You could add array, fields etc. mocks here if needed
  }); // End of object returned by multer()

  return multerFn; // Return the function that creates the multer instance object
});


// Mock multer-s3-v3
jest.mock('multer-s3-v3', () => {
  return jest.fn().mockImplementation((options) => {
    return { /* mock storage details if needed */ };
  });
});

// Mock S3Client
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    // Mock S3 methods if needed
  })),
}));


// --- Test Setup ---
const app = express();
app.use(express.json());

// Middleware to set simulation flags for multer mock
app.use((req, res, next) => {

    if (req.headers['x-simulate-multer-error']) {
        req.simulateMulterError = req.headers['x-simulate-multer-error'];
    }
    if (req.headers['x-simulate-no-file'] === 'true') {
        req.simulateNoFile = true;
    }
    next();
});

// --- Corrected Router Mounting (Matches app.js) ---
app.use('/image', uploadRouter); // Mount at the correct base path


// Add a generic error handler
app.use((err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}] Test App: Generic error handler caught:`, err.message);
  if (!res.headersSent) {
    const statusCode = err.message === 'Only image files are allowed!' ? 400 : 500;
    res.status(statusCode).json({ error: err.message || 'Internal Server Error from middleware' });
  } else {
     console.error(`[${req.method} ${req.originalUrl}] Test App: Headers already sent in error handler`);
    next(err);
  }
});

// Add a final handler for 404s
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found in test setup" });
});


// --- Test Suites ---
// --- Corrected Describe Block Name ---
describe('POST /image/upload/:propertyId', () => {
  const validPropertyId = new mongoose.Types.ObjectId().toString();
  const invalidPropertyId = 'invalid-id';
  const mockExistingImages = ['https://test-bucket.s3.us-east-1.amazonaws.com/some-image.jpg'];
  const mockPropertyDocument = {
    _id: validPropertyId,
    name: 'Test Property',
    images: [...mockExistingImages],
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks, including calls and implementations
    // Reset mocks with default implementations for success paths
    mockIsValidObjectId.mockReturnValue(true);
    Property.findByIdAndUpdate.mockImplementation((id, update, options) => {
        if (update && update.$push && update.$push.images !== undefined) {
            const newImageUrl = update.$push.images;
            return Promise.resolve({
                ...mockPropertyDocument,
                images: [...mockExistingImages, newImageUrl]
            });
        }
        return Promise.resolve(null); // Default if update structure doesn't match
    });
  });

   // Test using supertest
   it('should upload image and update property successfully', async () => {
     // Ensure findByIdAndUpdate returns a valid document for the success case
     Property.findByIdAndUpdate.mockImplementation((id, update, options) => {
         const newImageUrl = update.$push.images;
         return Promise.resolve({
             ...mockPropertyDocument,
             images: [...mockExistingImages, newImageUrl]
         });
     });

    // --- Corrected Request Path ---
    const response = await request(app)
      .post(`/image/upload/${validPropertyId}`) // Use full, correct path
      .send();

    // Assertions
    expect(mockIsValidObjectId).toHaveBeenCalledWith(validPropertyId);
    expect(Property.findByIdAndUpdate).toHaveBeenCalledWith(
      validPropertyId,
      { $push: { images: expect.any(String) } },
      { new: true, runValidators: true }
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Image uploaded and property updated successfully.');
    expect(response.body.property).toBeDefined();
    expect(response.body.property.images.length).toBeGreaterThan(mockExistingImages.length);
  });


  it('should return 400 if property ID is invalid', async () => {
    mockIsValidObjectId.mockReturnValue(false); // Override default for this test

    // --- Corrected Request Path ---
    const response = await request(app)
      .post(`/image/upload/${invalidPropertyId}`) // Use full, correct path
      .send();

    // Assertions
    expect(mockIsValidObjectId).toHaveBeenCalledWith(invalidPropertyId);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid property ID format');
    expect(Property.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should return 400 if no file is uploaded', async () => {
     // mockIsValidObjectId is true from beforeEach

     // --- Corrected Request Path ---
     const response = await request(app)
         .post(`/image/upload/${validPropertyId}`) // Use full, correct path
         .set('x-simulate-no-file', 'true') // Signal the mock
         .send();

     // Assertions
     expect(mockIsValidObjectId).toHaveBeenCalledWith(validPropertyId); // ID check runs
     expect(response.status).toBe(400); // Handler catches missing req.file
     expect(response.body.error).toBe('Image upload failed, no file received.');
     expect(Property.findByIdAndUpdate).not.toHaveBeenCalled();
 });


  it('should return 404 if property is not found', async () => {
    // mockIsValidObjectId is true from beforeEach
    Property.findByIdAndUpdate.mockResolvedValue(null); // Simulate property not found

    // --- Corrected Request Path ---
    const response = await request(app)
      .post(`/image/upload/${validPropertyId}`) // Use full, correct path
      .send();

    // Assertions
    expect(mockIsValidObjectId).toHaveBeenCalledWith(validPropertyId);
    expect(Property.findByIdAndUpdate).toHaveBeenCalledWith(
      validPropertyId,
      { $push: { images: expect.any(String) } },
      { new: true, runValidators: true }
    );
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Property not found.');
  });

  it('should return 500 if database update fails', async () => {
    // mockIsValidObjectId is true from beforeEach
    const dbError = new Error('Database connection error');
    Property.findByIdAndUpdate.mockRejectedValue(dbError); // Simulate DB error

    // --- Corrected Request Path ---
    const response = await request(app)
      .post(`/image/upload/${validPropertyId}`) // Use full, correct path
      .send();

    // Assertions
    expect(mockIsValidObjectId).toHaveBeenCalledWith(validPropertyId);
    expect(Property.findByIdAndUpdate).toHaveBeenCalledWith(
      validPropertyId,
      { $push: { images: expect.any(String) } },
      { new: true, runValidators: true }
    );
    expect(response.status).toBe(500);
    expect(response.body.error).toBe(dbError.message);
  });

   it('should return 500 if multer middleware throws an error (e.g., S3 issue)', async () => {
        const uploadErrorMsg = 'Simulated S3 upload failure';

        // --- Corrected Request Path ---
        const response = await request(app)
            .post(`/image/upload/${validPropertyId}`) // Use full, correct path
            .set('x-simulate-multer-error', uploadErrorMsg) // Signal the mock
            .send();

        // Assertions
        expect(mockIsValidObjectId).not.toHaveBeenCalled();
        expect(Property.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(response.body.error).toBe(uploadErrorMsg);
    });

     it('should return 400 if multer file filter rejects the file', async () => {
        const filterErrorMsg = 'Only image files are allowed!';

        // --- Corrected Request Path ---
        const response = await request(app)
            .post(`/image/upload/${validPropertyId}`) // Use full, correct path
            .set('x-simulate-multer-error', filterErrorMsg) // Signal the mock
            .send();

        // Assertions
        expect(mockIsValidObjectId).not.toHaveBeenCalled();
        expect(Property.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(filterErrorMsg);
    });
});