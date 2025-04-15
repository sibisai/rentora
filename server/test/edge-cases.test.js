/**
 * test/edge‑cases.test.js
 * Extra branch tests that push coverage ≥ 90 %.
 */

process.env.NODE_ENV  = 'test';
process.env.MONGO_URI = process.env.MONGO_URI_TEST;

const request  = require('supertest');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Property = require('../models/property');
const Booking  = require('../models/Booking');
const User     = require('../models/User');

/* -------------------------------------------------------------- */
/*               helper → app that **doesn’t** skip geocode       */
/* -------------------------------------------------------------- */
function freshAppNoTest() {
  // 1) mock *before* app.js is evaluated
  global.fetch = jest.fn();

  // 2) load a fresh copy of the app
  jest.resetModules();                       // clear require cache
  process.env.NODE_ENV = 'ci';               // anything ≠ 'test'
  process.env.MONGO_URI = process.env.MONGO_URI_TEST;
  // create a brand‑new mocked fetch for this app instance
  const app = require('../app');
  const fetch = global.fetch; 
  return { app, fetch };
}

/* default app that keeps NODE_ENV='test' (skips geocoding) */
const appTest = require('../app');

/* -------------------------------------------------------------- */
/*                 DB connect / cleanup / teardown                */
/* -------------------------------------------------------------- */
beforeAll(() => mongoose.connect(process.env.MONGO_URI_TEST));
afterAll(async () => {
  await mongoose.connection.close();
  // helps Jest detect open handles
  await mongoose.disconnect();
});

afterEach(async () => {
  jest.resetAllMocks();
  await Promise.all([
    Property.deleteMany({}),
    Booking.deleteMany({}),
    User.deleteMany({}),
  ]);
});

/* -------------------------------------------------------------- */
/*           1. Property creation – geocoding failure             */
/* -------------------------------------------------------------- */
describe('Property creation – geocoding failure branches', () => {
  const baseBody = {
    title: 'Edge Property',
    description: 'For coverage',
    location: {
      address:'1 Infinite Loop',
      city:'Cupertino',
      state:'CA',
      zip:'95014',
      country:'USA',
    },
    price: 99,
    images: ['x'],
    amenities: [],
    propertyType: 'House',
    rooms: 1,
    hostId: new mongoose.Types.ObjectId(),
  };

  test('Nominatim !ok ⇒ 400', async () => {
    const { app, fetch } = freshAppNoTest();
    fetch.mockResolvedValue({ ok:false, status:500, json:async() => [] });
    const r = await request(app).post('/properties').send(baseBody);
    expect(r.status).toBe(400);
  });

  test('Nominatim [] ⇒ 400', async () => {
    const { app, fetch } = freshAppNoTest();
    fetch.mockResolvedValue({ ok:true, status:200, json:async()=>[] });
    const r = await request(app).post('/properties').send(baseBody);
    expect(r.status).toBe(400);
  });

  test('Nominatim non‑numeric ⇒ 400', async () => {
    const { app, fetch } = freshAppNoTest();
    fetch.mockResolvedValue({ ok:true, status:200, json:async()=>[ { lon:'abc', lat:'xyz' } ] });
    const r = await request(app).post('/properties').send(baseBody);
    expect(r.status).toBe(400);
  });
});

/* -------------------------------------------------------------- */
/*           2. Property search – query‑string branches           */
/* -------------------------------------------------------------- */
describe('Property search – query‑string branches', () => {
  let propId;
  beforeEach(async () => {
    const p = await Property.create({
      title:'Near Zero',
      description:'origin',
      location:{
        address:'0 Main',
        city:'Nowhere',
        state:'ZZ',
        zip:'00000',
        country:'NA',
        coordinates:{ type:'Point', coordinates:[0,0] },
      },
      price: 50,
      propertyType:'Apartment',
      rooms:1,
      hostId:new mongoose.Types.ObjectId(),
    });
    propId = p._id;
  });

  test('bad date range ⇒ 400', async () => {
    const r = await request(appTest)
      .get('/properties')
      .query({ checkIn:'2025-05-10', checkOut:'2025-05-05' });
    expect(r.status).toBe(400);
  });

  test('geospatial filter finds nearby property', async () => {
    const r = await request(appTest)
      .get('/properties')
      .query({ latitude:0, longitude:0, radius:1 });
    expect(r.body.map(p => p._id)).toContain(propId.toString());
  });

  test('price filter excludes cheap property', async () => {
    const r = await request(appTest)
      .get('/properties')
      .query({ minPrice:100, maxPrice:400 });
    expect(r.body.length).toBe(0);
  });
});

/* -------------------------------------------------------------- */
/*            3. Property GET by id – bad ids                     */
/* -------------------------------------------------------------- */
describe('Property GET by id – bad ids', () => {
  test('invalid ObjectId format ⇒ 400', async () => {
    const r = await request(appTest).get('/properties/not-an-id');
    expect(r.status).toBe(400);
  });

  test('valid but missing id ⇒ 404', async () => {
    const r = await request(appTest).get(`/properties/${new mongoose.Types.ObjectId()}`);
    expect(r.status).toBe(404);
  });
});

/* -------------------------------------------------------------- */
/*                      4. auth.js edges                          */
/* -------------------------------------------------------------- */
describe('Auth edge cases', () => {
  test('duplicate signup ⇒ 409', async () => {
    await User.create({ email:'dup@mail.com', password:'x' });
    const r = await request(appTest).post('/auth/signup')
                                    .send({ email:'dup@mail.com', password:'y' });
    expect(r.status).toBe(409);
  });

  test('wrong password ⇒ 401', async () => {
    const pw = await bcrypt.hash('right',10);
    await User.create({ email:'who@mail.com', password:pw });
    const r = await request(appTest).post('/auth/login')
                                    .send({ email:'who@mail.com', password:'wrong' });
    expect(r.status).toBe(401);
  });
});

/* -------------------------------------------------------------- */
/*                    5. booking.js edge cases                    */
/* -------------------------------------------------------------- */
describe('Booking edge cases', () => {
  let userId, propertyId;
  beforeEach(async () => {
    userId = (await User.create({ email:'b@mail.com', password:'x' }))._id;
    propertyId = (await Property.create({
      title:'B Prop',
      description:'dummy',
      location:{
        address:'1 Way',
        city:'Here',
        state:'YY',
        zip:'11111',
        country:'NA',
        coordinates:{ type:'Point', coordinates:[0,0] },
      },
      price:1,
      propertyType:'Cabin',
      rooms:1,
      hostId:new mongoose.Types.ObjectId(),
    }))._id;
  });

  test('overlapping booking ⇒ 409', async () => {
    await Booking.create({
      property:propertyId,
      user:userId,
      startDate:new Date('2025-01-01'),
      endDate:new Date('2025-01-05'),
    });
    const r = await request(appTest).post('/bookings').send({
      propertyId, userId,
      startDate:'2025-01-03',
      endDate:'2025-01-07',
    });
    expect(r.status).toBe(409);
  });

  test('endDate < startDate ⇒ 400', async () => {
    const r = await request(appTest).post('/bookings').send({
      propertyId, userId,
      startDate:'2025-02-10',
      endDate:'2025-02-05',
    });
    expect(r.status).toBe(400);
  });

  test('delete non‑existent booking ⇒ 404', async () => {
    const r = await request(appTest)
      .delete(`/bookings/${new mongoose.Types.ObjectId()}`);
    expect(r.status).toBe(404);
  });
});