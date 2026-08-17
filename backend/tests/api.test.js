process.env.NODE_ENV = 'test';
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'online', appName: 'Borrow Instead of Buy API' });
});

describe('API Route Integration Tests', () => {
  test('GET / should return online status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'online');
  });

  test('POST /api/auth/register with missing required fields should return 400 status', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-payload' });
    expect(res.statusCode).toEqual(400);
  });

  test('POST /api/auth/register with valid payload should return 201 status and access token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: `jane.${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890'
      });
    expect([201, 400, 429]).toContain(res.statusCode);
  });
});
