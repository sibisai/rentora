const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to a test database before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Clear the User collection before each test suite
  await User.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('User created successfully');

    // Verify the user was created in the database
    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).toBeDefined();
  });

  it('should not register a user with an existing email', async () => {
    // First, create a user
    await User.create({ email: 'existing@example.com', password: 'hashedpassword' });

    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'existing@example.com',
        password: 'anotherpassword',
      });
    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('A user with this email already exists.');
  });

  it('should log in an existing user', async () => {
      // Create a user to log in - Provide the PLAIN password
      // Let the pre('save') hook in the User model handle the hashing automatically
      await User.create({ email: 'login@example.com', password: 'loginpassword' });

      // Now try to log in with the correct plain password
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'loginpassword',
        });

      // Assertion should now pass
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Login successful');
      expect(res.body.token).toBeDefined(); // Also good to check for the token
    });

  it('should not log in with incorrect password', async () => {
    // Create a user
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    await User.create({ email: 'wrongpassword@example.com', password: hashedPassword });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'wrongpassword@example.com',
        password: 'incorrectpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid email or password.');
  });

  it('should not log in with non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'anypassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid email or password.');
  });

  it('should require email and password for signup', async () => {
    const res1 = await request(app).post('/auth/signup').send({ password: 'password' });
    expect(res1.statusCode).toBe(400);
    expect(res1.body.message).toBe('Email and password are required.');

    const res2 = await request(app).post('/auth/signup').send({ email: 'test@example.com' });
    expect(res2.statusCode).toBe(400);
    expect(res2.body.message).toBe('Email and password are required.');
  });

  it('should require email and password for login', async () => {
    // Create a user for this test
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await User.create({ email: 'required@example.com', password: hashedPassword });

    const res1 = await request(app).post('/auth/login').send({ password: 'password' });
    expect(res1.statusCode).toBe(400);
    expect(res1.body.message).toBe('Email and password are required.');

    const res2 = await request(app).post('/auth/login').send({ email: 'required@example.com' });
    expect(res2.statusCode).toBe(400);
    expect(res2.body.message).toBe('Email and password are required.');
  });

  // mount a dummy protected route to exercise the middleware
  const { authenticate } = require('../routes/auth');
  app.get('/auth/protected', authenticate, (_req, res) => {
    res.json({ ok: true });
  });

  describe('Additional Auth edge cases', () => {
    it('returns 401 when no Authorization header is present', async () => {
      const res = await request(app).get('/auth/protected');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Missing or invalid Authorization header');
    });

    it('returns 500 when JWT_SECRET is not set on login', async () => {
      // create a user to log in
      await User.create({ email: 'noenv@mail.com', password: 'pass123' });
      // remove the secret
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'noenv@mail.com', password: 'pass123' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server configuration error.');

      // restore
      process.env.JWT_SECRET = original;
    });

    it('returns 400 Validation Error when signup data fails schema validation', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'not-an-email', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
      expect(res.body.details).toBeDefined();
    });
  });
});