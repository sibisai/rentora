// test/property.test.js
const request = require('supertest');
const app = require('../app'); // Assuming your Express app instance is exported from 'app.js'
const mongoose = require('mongoose');
const Property = require('../models/property'); // Ensure this path points to your updated schema file
require('dotenv').config();

let testHostId; // Define hostId to be used across tests

// Connect to a test database before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Mongoose 6+ doesn't require these options explicitly, but keep if using older versions
  });
  // Clear the Property collection before the test suite starts
  await Property.deleteMany({});
  // Generate a reusable dummy host ID
  testHostId = new mongoose.Types.ObjectId();
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Clear the collection and create a fresh test property before each test
beforeEach(async () => {
  await Property.deleteMany({}); // Clear before each test for isolation
  const newProperty = new Property({
    title: 'Test Title',
    description: 'Test Description',
    location: {
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      country: 'Test Country',
    },
    price: 100,
    images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
    amenities: ['WiFi', 'Parking', 'Kitchen'],
    propertyType: 'Apartment',
    rooms: 2,
    hostId: testHostId, // Use the generated dummy hostId
  });
  testProperty = await newProperty.save();
});

describe('Property Endpoints', () => {
  it('should create a new property', async () => {
    const newHostId = new mongoose.Types.ObjectId(); // Can use a different ID or the same testHostId
    const res = await request(app)
      .post('/properties')
      .send({
        title: 'New Title',
        description: 'New Description',
        location: {
          address: '456 New Ave',
          city: 'New City',
          state: 'NS',
          zip: '67890',
          country: 'New Country',
        },
        price: 150,
        images: ['http://example.com/new_image.png'],
        amenities: ['Pool', 'Gym'],
        propertyType: 'House',
        rooms: 3,
        hostId: newHostId.toString(), // Send as string if expected by the backend
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('New Title');
    expect(res.body.description).toEqual('New Description');
    expect(res.body.location.address).toEqual('456 New Ave');
    expect(res.body.location.city).toEqual('New City');
    expect(res.body.location.state).toEqual('NS');
    expect(res.body.location.zip).toEqual('67890');
    expect(res.body.location.country).toEqual('New Country');
    expect(res.body.price).toEqual(150);
    expect(res.body.images).toEqual(['http://example.com/new_image.png']);
    expect(res.body.amenities).toEqual(['Pool', 'Gym']);
    expect(res.body.propertyType).toEqual('House');
    expect(res.body.rooms).toEqual(3);
    expect(res.body.hostId).toEqual(newHostId.toString()); // Compare string representation
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('should get all properties', async () => {
    // Add another property to test retrieval of multiple items
    const anotherHostId = new mongoose.Types.ObjectId();
    await new Property({
        title: 'Another Title',
        description: 'Another Description',
        location: { address: '789 Other Ln', city: 'Other City', state: 'OS', zip: '11223', country: 'Other Country' },
        price: 250, propertyType: 'Condo', rooms: 1, hostId: anotherHostId
    }).save();

    const res = await request(app).get('/properties');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2); // Should have at least the two properties created

    // Check the structure of the first property (from beforeEach)
    const firstProperty = res.body.find(p => p._id === testProperty._id.toString());
    expect(firstProperty).toBeDefined();
    expect(firstProperty).toHaveProperty('_id');
    expect(firstProperty).toHaveProperty('title', 'Test Title');
    expect(firstProperty).toHaveProperty('description', 'Test Description');
    expect(firstProperty).toHaveProperty('location');
    expect(firstProperty.location).toHaveProperty('address', '123 Test St');
    expect(firstProperty).toHaveProperty('price', 100);
    expect(firstProperty).toHaveProperty('images');
    expect(Array.isArray(firstProperty.images)).toBe(true);
    expect(firstProperty).toHaveProperty('amenities');
    expect(Array.isArray(firstProperty.amenities)).toBe(true);
    expect(firstProperty).toHaveProperty('propertyType', 'Apartment');
    expect(firstProperty).toHaveProperty('rooms', 2);
    expect(firstProperty).toHaveProperty('hostId', testHostId.toString());
    expect(firstProperty).toHaveProperty('createdAt');
    expect(firstProperty).toHaveProperty('updatedAt');
  });

  it('should get a specific property by ID', async () => {
    const res = await request(app).get(`/properties/${testProperty._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', testProperty._id.toString());
    expect(res.body.title).toEqual('Test Title');
    expect(res.body.description).toEqual('Test Description');
    expect(res.body.location.address).toEqual('123 Test St');
    expect(res.body.location.city).toEqual('Test City');
    expect(res.body.location.state).toEqual('TS');
    expect(res.body.location.zip).toEqual('12345');
    expect(res.body.location.country).toEqual('Test Country');
    expect(res.body.price).toEqual(100);
    expect(res.body.images).toEqual(['http://example.com/image1.jpg', 'http://example.com/image2.jpg']);
    expect(res.body.amenities).toEqual(['WiFi', 'Parking', 'Kitchen']);
    expect(res.body.propertyType).toEqual('Apartment');
    expect(res.body.rooms).toEqual(2);
    expect(res.body.hostId).toEqual(testHostId.toString());
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('should return 404 if a property is not found by ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/properties/${invalidId}`);
    expect(res.statusCode).toEqual(404);
    // Check the error message based on your API's actual response
    expect(res.body.error).toMatch(/Property not found/i);
  });

  it('should update an existing property', async () => {
    const updatedData = {
      title: 'Updated Title',
      price: 200,
      amenities: ['WiFi', 'Pool', 'Updated Amenity'], // Update amenities
      // Add other fields to update if needed
    };
    const res = await request(app)
      .put(`/properties/${testProperty._id}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', testProperty._id.toString());
    expect(res.body.title).toEqual('Updated Title');
    expect(res.body.price).toEqual(200);
    expect(res.body.amenities).toEqual(['WiFi', 'Pool', 'Updated Amenity']);
    // Check other fields to ensure they weren't unintentionally changed
    expect(res.body.description).toEqual(testProperty.description);
    expect(res.body.location.address).toEqual(testProperty.location.address);
    expect(res.body.propertyType).toEqual(testProperty.propertyType);
    expect(res.body.rooms).toEqual(testProperty.rooms);
    expect(res.body.hostId).toEqual(testProperty.hostId.toString());
    expect(res.body).toHaveProperty('updatedAt');
    // Check that updatedAt is greater than createdAt (or the original updatedAt)
    const originalUpdatedAt = new Date(testProperty.updatedAt).getTime();
    const newUpdatedAt = new Date(res.body.updatedAt).getTime();
    expect(newUpdatedAt).toBeGreaterThan(originalUpdatedAt);


    // Verify the update in the database
    const updatedProperty = await Property.findById(testProperty._id);
    expect(updatedProperty.title).toEqual('Updated Title');
    expect(updatedProperty.price).toEqual(200);
    expect(updatedProperty.amenities).toEqual(['WiFi', 'Pool', 'Updated Amenity']);
  });

  it('should return 404 if trying to update a non-existent property', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const updatedData = { title: 'Updated Title' };
    const res = await request(app)
      .put(`/properties/${invalidId}`)
      .send(updatedData);
    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toMatch(/Property not found/i);
  });

  it('should delete a property', async () => {
    const res = await request(app).delete(`/properties/${testProperty._id}`);
    expect(res.statusCode).toEqual(204); // Or 200 with a confirmation message depending on your API
    // If 204, body should be empty. If 200, check for confirmation message.
    if (res.statusCode === 204) {
        expect(res.body).toEqual({});
    } else if (res.statusCode === 200) {
        expect(res.body.message).toMatch(/Property deleted successfully/i); // Adjust message as needed
    }


    // Verify the deletion from the database
    const deletedProperty = await Property.findById(testProperty._id);
    expect(deletedProperty).toBeNull();
  });

  it('should return 404 if trying to delete a non-existent property', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/properties/${invalidId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toMatch(/Property not found/i);
  });
});