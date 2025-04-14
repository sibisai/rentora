// test/booking.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/property'); // Uses the updated schema
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let testHostId; // Dummy ID for property owner (host)
let testUserId; // ID of the user making the booking
let testPropertyId; // ID of the property being booked

// Connect to the test database and setup initial data before all tests
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // Clear relevant collections once before the suite starts
    await Booking.deleteMany({});
    await Property.deleteMany({});
    await User.deleteMany({});

    // Create a reusable test user for making bookings
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const newUser = new User({ email: 'testuser@example.com', password: hashedPassword });
    const savedUser = await newUser.save();
    testUserId = savedUser._id;

    // Create a reusable dummy host ID for property creation
    testHostId = new mongoose.Types.ObjectId();
});

// Close the database connection after all tests run
afterAll(async () => {
    await mongoose.connection.close();
});

// Before each test, clear bookings and create a fresh property
beforeEach(async () => {
    // Ensure a clean slate for bookings before each test
    await Booking.deleteMany({});

    // Create a standard property for booking tests, using the current schema
    const newProperty = new Property({
        title: 'Standard Test Property for Booking',
        description: 'A property created before each booking test.',
        location: {
            address: '123 Main St',
            city: 'Testville',
            state: 'TS',
            zip: '12345',
            country: 'Testland',
        },
        price: 150,
        images: ['http://example.com/main.jpg'],
        amenities: ['WiFi', 'AC'],
        propertyType: 'House',
        rooms: 3,
        hostId: testHostId, // Link property to a host
    });
    const savedProperty = await newProperty.save();
    testPropertyId = savedProperty._id;

    // Verify the test user ID is available
    expect(testUserId).toBeDefined();
});

describe('Booking Endpoints', () => {

    // === Test POST /bookings ===

    it('should create a new booking successfully', async () => {
        const bookingData = {
            propertyId: testPropertyId.toString(),
            userId: testUserId.toString(),
            startDate: '2025-10-01',
            endDate: '2025-10-05',
        };
        const res = await request(app)
            .post('/bookings')
            .send(bookingData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.property).toEqual(testPropertyId.toString());
        expect(res.body.user).toEqual(testUserId.toString()); // Create endpoint likely returns IDs
        expect(res.body.startDate).toMatch('2025-10-01');
        expect(res.body.endDate).toMatch('2025-10-05');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 400 if required booking details (e.g., propertyId) are missing', async () => {
        const incompleteData = {
            // propertyId missing
            userId: testUserId.toString(),
            startDate: '2025-11-01',
            endDate: '2025-11-05',
        };
        const res = await request(app)
            .post('/bookings')
            .send(incompleteData);

        expect(res.statusCode).toEqual(400);
        // Check for a generic validation error message pattern
        expect(res.body.message).toMatch(/required/i);
    });

    it('should return 404 if the propertyId refers to a non-existent property', async () => {
        const nonExistentPropertyId = new mongoose.Types.ObjectId();
        const bookingData = {
            propertyId: nonExistentPropertyId.toString(), // Valid format, but doesn't exist
            userId: testUserId.toString(),
            startDate: '2025-12-01',
            endDate: '2025-12-05',
        };
        const res = await request(app)
            .post('/bookings')
            .send(bookingData);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/Property not found/i);
    });

    it('should return 404 if the userId refers to a non-existent user', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const bookingData = {
            propertyId: testPropertyId.toString(),
            userId: nonExistentUserId.toString(), // Valid format, but doesn't exist
            startDate: '2025-12-10',
            endDate: '2025-12-15',
        };
        const res = await request(app)
            .post('/bookings')
            .send(bookingData);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toMatch(/User not found/i);
    });

    // === Test GET /bookings (General Listing) ===
    // Note: This endpoint might require authentication or admin privileges in a real app.
    // Adjust test based on actual implementation (e.g., add auth headers).
    it('should retrieve a list of all bookings', async () => {
        // Create at least one booking to ensure the list isn't empty
        await request(app)
            .post('/bookings')
            .send({
                propertyId: testPropertyId.toString(),
                userId: testUserId.toString(),
                startDate: '2025-06-01',
                endDate: '2025-06-03',
            });

        // Assuming GET /bookings fetches all bookings without auth for this test setup
        const res = await request(app).get('/bookings');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        // Check that essential booking fields are present in the first item
        expect(res.body[0]).toHaveProperty('property');
        expect(res.body[0]).toHaveProperty('user');
        expect(res.body[0]).toHaveProperty('startDate');
        expect(res.body[0]).toHaveProperty('endDate');
    });


    // === Test GET /properties/:propertyId/bookings ===

    it('should retrieve bookings only for a specific property', async () => {
        // Booking 1: Belongs to the target property (testPropertyId)
        const booking1 = await request(app)
            .post('/bookings')
            .send({
                propertyId: testPropertyId.toString(),
                userId: testUserId.toString(),
                startDate: '2025-07-01',
                endDate: '2025-07-04',
            });
        expect(booking1.statusCode).toEqual(201); // Verify creation

        // Create another property to ensure filtering works correctly
        const anotherProperty = new Property({
             title: 'Another Property, Different Bookings',
             description: 'This property should not appear in the filtered results.',
             location: { address: '456 Side St', city: 'Otherplace', state: 'OS', zip: '67890', country: 'Testland' },
             price: 200, propertyType: 'Condo', rooms: 2, hostId: testHostId
        });
        const savedAnotherProperty = await anotherProperty.save();

        // Booking 2: Belongs to the *other* property
        const booking2 = await request(app)
            .post('/bookings')
            .send({
                propertyId: savedAnotherProperty._id.toString(),
                userId: testUserId.toString(), // Same user, different property
                startDate: '2025-08-01',
                endDate: '2025-08-03',
            });
        expect(booking2.statusCode).toEqual(201); // Verify creation

        // Now, fetch bookings specifically for the primary test property
        const res = await request(app).get(`/properties/${testPropertyId}/bookings`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Should only retrieve the booking associated with testPropertyId
        expect(res.body.length).toEqual(1);

        // Verify the details of the retrieved booking
        const retrievedBooking = res.body[0];
        expect(retrievedBooking.property).toEqual(testPropertyId.toString());

        // *** FIX: Check the _id within the populated user object ***
        expect(retrievedBooking.user).toBeInstanceOf(Object); // Verify user is populated (an object)
        expect(retrievedBooking.user._id).toEqual(testUserId.toString()); // Compare the ID within the object

        expect(retrievedBooking).toHaveProperty('startDate');
        expect(retrievedBooking).toHaveProperty('endDate');
        // Optionally check specific user details if needed and populated
        // expect(retrievedBooking.user.email).toEqual('testuser@example.com');
    });

    // --- Edge Cases for GET /properties/:propertyId/bookings ---

    it('should return an empty array when retrieving bookings for a property with no bookings', async () => {
        // testPropertyId is created in beforeEach, but no bookings are added for it yet in this test
        const res = await request(app).get(`/properties/${testPropertyId}/bookings`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(0); // Expect empty array
    });

    it('should return 400 Bad Request when retrieving bookings with an invalid property ID format', async () => {
        const invalidFormatId = 'this-is-not-an-objectid';
        const res = await request(app).get(`/properties/${invalidFormatId}/bookings`);

        // Expect 400 specifically now
        expect(res.statusCode).toEqual(400);
        // Check for the specific error message from the updated route
        expect(res.body.message).toMatch(/Invalid property ID format/i);
    });

    // The non-existent property ID test should now pass without changes:
    it('should return 404 Not Found when retrieving bookings for a valid but non-existent property ID', async () => {
        const nonExistentPropertyId = new mongoose.Types.ObjectId(); // Valid format, but not saved
        const res = await request(app).get(`/properties/${nonExistentPropertyId}/bookings`);

        expect(res.statusCode).toEqual(404); // This should now work
        expect(res.body.message).toMatch(/Property not found/i); // This should also work
    });

});