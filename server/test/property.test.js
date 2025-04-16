const request = require('supertest');
const app = require('../app'); // Assuming your Express app instance is exported from 'app.js'
const mongoose = require('mongoose');
const Property = require('../models/property'); // Ensure this path points to your updated schema file
require('dotenv').config();

let testProperty; // Define testProperty to be accessible in tests
let testHostId; // Define hostId to be used across tests
let originalNodeEnv; // To store original NODE_ENV

// Store original NODE_ENV before all tests
beforeAll(async () => {
  originalNodeEnv = process.env.NODE_ENV; // Store original NODE_ENV
  process.env.NODE_ENV = 'test'; // Ensure it starts as 'test' for other tests

  await mongoose.connect(process.env.MONGO_URI_TEST, {
    // useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+
    // Remove them if using Mongoose 6 or later
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
  // Clear the Property collection before the test suite starts
  await Property.deleteMany({});
  // Generate a reusable dummy host ID
  testHostId = new mongoose.Types.ObjectId();
});

// Close the database connection and restore NODE_ENV after all tests
afterAll(async () => {
  await mongoose.connection.close();
  process.env.NODE_ENV = originalNodeEnv; // Restore original NODE_ENV
});

// Restore any mocks after each test
afterEach(() => {
    jest.restoreAllMocks(); // Restore spies/mocks
    process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is reset to 'test' after each test
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
      // Add default coordinates as they would be added in test env
      coordinates: { type: 'Point', coordinates: [0, 0] }
    },
    price: 100,
    images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
    amenities: ['WiFi', 'Parking', 'Kitchen'],
    propertyType: 'Apartment', // Valid type
    rooms: 2,
    hostId: testHostId, // Use the generated dummy hostId
  });
  testProperty = await newProperty.save();
});

describe('Property Endpoints', () => {
  it('should create a new property (in test env)', async () => {
    // This test runs with NODE_ENV='test', skipping real geocoding
    const newHostId = new mongoose.Types.ObjectId();
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
        hostId: newHostId.toString(),
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('New Title');
    // Check that default coordinates were added in test env
    expect(res.body.location.coordinates.coordinates).toEqual([0, 0]);
  });

  // --- Tests for Geocoding Logic ---

  it('should return 400 if geocoding receives invalid coordinates (non-test env)', async () => {
    // --- Arrange ---
    process.env.NODE_ENV = 'development'; // Bypass test check
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Mock fetch to return invalid (non-numeric) coordinates
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ lat: 'not-a-number', lon: 'invalid' }]), // Invalid coordinates
    });

    // --- Act ---
    const res = await request(app)
      .post('/properties')
      .send({
        title: 'Invalid Coords Test',
        description: 'Testing invalid coords from geocoding',
        location: {
          address: '1 Good Address St', // Provide seemingly valid address
          city: 'Valid City',
          state: 'VC',
          zip: '54321',
          country: 'Valid Country',
        },
        price: 200,
        propertyType: 'Castle',
        rooms: 10,
        hostId: new mongoose.Types.ObjectId().toString(),
      });

    // --- Assert ---
    expect(res.statusCode).toEqual(400);
     // Expect the intended geocoding error here, as validation shouldn't fail if address is provided
    expect(res.body.error).toMatch(/Could not determine coordinates/i);
    // Check if the specific warning for invalid coordinates was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Geocoding failed: Invalid coordinates received from Nominatim."),
        expect.objectContaining({ lat: 'not-a-number', lon: 'invalid' }) // Check the logged object
    );

    // --- Cleanup (handled by afterEach) ---
  });

   it('should return 400 if geocoding fetch fails (non-test env)', async () => {
    // --- Arrange ---
    process.env.NODE_ENV = 'development'; // Bypass test check
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock fetch to simulate a network error or non-ok response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false, // Simulate failed request
        status: 500, // Example status code
    });

    // --- Act ---
    const res = await request(app)
      .post('/properties')
      .send({
        title: 'Fetch Fail Test',
        description: 'Testing failed fetch during geocoding',
        location: {
          address: '1 Network Error Way',
          city: 'Fail City',
          state: 'FC',
          zip: '99999',
          country: 'Fail Country',
        },
        price: 300,
        propertyType: 'Bunker',
        rooms: 5,
        hostId: new mongoose.Types.ObjectId().toString(),
      });

    // --- Assert ---
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Could not determine coordinates/i);
    // Check if the specific error for the failed request was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Geocoding error:",
        expect.stringContaining("Nominatim request failed with status 500")
    );

    // --- Cleanup (handled by afterEach) ---
  });

   it('should return 400 if geocoding finds no results (non-test env)', async () => {
    // --- Arrange ---
    process.env.NODE_ENV = 'development'; // Bypass test check
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Mock fetch to return an empty array (no results)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ([]), // Empty array signifies no results
    });

    // --- Act ---
    const res = await request(app)
      .post('/properties')
      .send({
        title: 'No Results Test',
        description: 'Testing no results from geocoding',
        location: {
          address: '1 Nonexistent Place',
          city: 'Nowhere',
          state: 'NA',
          zip: '00000',
          country: 'Atlantis',
        },
        price: 1000,
        propertyType: 'Island',
        rooms: 100,
        hostId: new mongoose.Types.ObjectId().toString(),
      });

    // --- Assert ---
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Could not determine coordinates/i);
    // Check if the specific warning for no results was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith("Geocoding failed: No results found for address.");

    // --- Cleanup (handled by afterEach) ---
  });


  // --- Standard Property Endpoint Tests ---

  it('should get all properties', async () => {
    // Add another property to test retrieval of multiple items
    const anotherHostId = new mongoose.Types.ObjectId();
    await new Property({
        title: 'Another Title',
        description: 'Another Description',
        location: { address: '789 Other Ln', city: 'Other City', state: 'OS', zip: '11223', country: 'Other Country', coordinates: { type: 'Point', coordinates: [1, 1] } },
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
    // ... (rest of assertions for get all)
  });

  it('should get a specific property by ID', async () => {
    const res = await request(app).get(`/properties/${testProperty._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', testProperty._id.toString());
    expect(res.body.title).toEqual('Test Title');
    // ... (rest of assertions for get by id)
  });

  it('should return 404 if a property is not found by ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/properties/${invalidId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toMatch(/Property not found/i);
  });

  it('should update an existing property (without location change)', async () => {
    const updatedData = {
      title: 'Updated Title',
      price: 200,
      amenities: ['WiFi', 'Pool', 'Updated Amenity'],
    };
    const res = await request(app)
      .put(`/properties/${testProperty._id}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Updated Title');
    expect(res.body.price).toEqual(200);
    expect(res.body.amenities).toEqual(['WiFi', 'Pool', 'Updated Amenity']);
    // ... (rest of assertions for update)

    // Verify the update in the database
    const updatedProperty = await Property.findById(testProperty._id);
    expect(updatedProperty.title).toEqual('Updated Title');
    expect(updatedProperty.price).toEqual(200);
  });

  it('should update property location and trigger geocoding (non-test env)', async () => {
      // --- Arrange ---
      process.env.NODE_ENV = 'development'; // Bypass test check
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      // Mock fetch to return valid coordinates
      const mockCoords = { longitude: -118.40, latitude: 33.94 }; // Example LAX coords
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
          ok: true,
          json: async () => ([{ lat: mockCoords.latitude.toString(), lon: mockCoords.longitude.toString() }]),
      });

      const updatedLocationData = {
          location: {
              address: '1 World Way', // Changed address
              city: 'Los Angeles',
              state: 'CA',
              zip: '90045',
              country: 'USA'
          },
          title: 'Updated Location Title'
      };

      // --- Act ---
      const res = await request(app)
          .put(`/properties/${testProperty._id}`)
          .send(updatedLocationData);

      // --- Assert ---
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Updated Location Title');
      expect(res.body.location.address).toEqual('1 World Way');
      expect(res.body.location.city).toEqual('Los Angeles');
      expect(consoleLogSpy).toHaveBeenCalledWith("Address change detected, attempting geocoding for update.");
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Geocoding query: 1 World Way"));
      expect(consoleLogSpy).toHaveBeenCalledWith(`Geocoding successful: [${mockCoords.longitude}, ${mockCoords.latitude}]`);
      expect(res.body.location.coordinates.coordinates).toEqual([mockCoords.longitude, mockCoords.latitude]);

      // Verify in DB
      const updatedDbProperty = await Property.findById(testProperty._id);
      expect(updatedDbProperty.location.coordinates.coordinates).toEqual([mockCoords.longitude, mockCoords.latitude]);

      // --- Cleanup (handled by afterEach) ---
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

  // --- Tests for PUT /properties/:id catch block ---

  it('should return 400 on validation error during property update', async () => {
    // --- Arrange ---
    const invalidUpdateData = {
        price: -50, // Invalid price according to potential schema validation (min: 0)
        propertyType: 'InvalidType' // Assuming this is not in schema enum
    };

    // --- Act ---
    const res = await request(app)
        .put(`/properties/${testProperty._id}`)
        .send(invalidUpdateData);

    // --- Assert ---
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Validation Error');
    // Optionally check details if needed, depends on Mongoose error message format
    expect(res.body.details).toBeDefined();
  });

  it('should return 500 if a non-validation error occurs during property update', async () => {
    // --- Arrange ---
    const updateData = { title: 'Attempted Update Title' };
    const errorMessage = 'Simulated generic DB update error';
    // Mock findByIdAndUpdate to throw a generic error
    jest.spyOn(Property, 'findByIdAndUpdate').mockRejectedValueOnce(new Error(errorMessage));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


    // --- Act ---
    const res = await request(app)
        .put(`/properties/${testProperty._id}`)
        .send(updateData);

    // --- Assert ---
    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toEqual('Failed to update property');
    expect(res.body.details).toEqual(errorMessage);
    // Check that the specific console error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error updating property ${testProperty._id}:`,
        expect.any(Error) // Check that an Error object was logged
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.anything(), // First argument is the string message
        expect.objectContaining({ message: errorMessage }) // Second argument is the error object
    );

    // --- Cleanup (handled by afterEach) ---
  });


  // --- DELETE Tests ---

  it('should delete a property', async () => {
    const res = await request(app).delete(`/properties/${testProperty._id}`);
    expect(res.statusCode).toEqual(204);
    expect(res.body).toEqual({});

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