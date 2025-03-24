// __tests__/routes/userRoutes.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const userRoutes = require('../../routes/userRoutes');
const User = require('../../models/User');
const authenticateToken = require('../../middleware/authMiddleware');
const { validatePreferences } = require('../../models/validation');

// Mock the dependencies
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('../../middleware/authMiddleware');
jest.mock('../../models/validation');

const app = express();
app.use(express.json());
app.use('/', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticateToken to pass through with a test user ID
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 'testUserId' };
      next();
    });
  });

  describe('GET /users/:therapistId', () => {
    it('should return all users for a therapist', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1' },
        { _id: '2', username: 'user2' }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      const response = await request(app)
        .get('/users/testTherapistId')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalledWith({ therapistId: 'testTherapistId' });
    });

    it('should handle database errors', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/users/testTherapistId')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle empty results', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/users/testTherapistId')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /user', () => {
    it('should return authenticated user details', async () => {
      const mockUser = { _id: 'testUserId', username: 'testUser' };
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const response = await request(app)
        .get('/user')
        .expect(200);

      expect(response.body).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get('/user')
        .expect(404);

      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should handle database errors', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/user')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle authentication failure', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/user')
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('GET /preferences', () => {
    it('should return user preferences', async () => {
      const mockUser = {
        _id: 'testUserId',
        preferences: { hand: 'Right' }
      };

      User.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/preferences')
        .expect(200);

      expect(response.body).toEqual(mockUser.preferences);
    });

    it('should return 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/preferences')
        .expect(404);

      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should handle database errors', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/preferences')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /preferences', () => {
    const newPreferences = { hand: 'Right' };

    it('should update user preferences', async () => {
      validatePreferences.mockReturnValue({ error: null });
      
      const mockUpdatedUser = {
        _id: 'testUserId',
        preferences: newPreferences
      };

      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/preferences')
        .send({ preferences: newPreferences })
        .expect(200);

      expect(response.body).toEqual(newPreferences);
    });

    it('should return 400 for invalid preferences', async () => {
      validatePreferences.mockReturnValue({
        error: { details: [{ message: 'Invalid preferences' }] }
      });

      const response = await request(app)
        .put('/preferences')
        .send({ preferences: { hand: 'Invalid' } })
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid preferences' });
    });

    it('should return 404 when user not found', async () => {
      validatePreferences.mockReturnValue({ error: null });
      User.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/preferences')
        .send({ preferences: newPreferences })
        .expect(404);

      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should handle database errors', async () => {
      validatePreferences.mockReturnValue({ error: null });
      User.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/preferences')
        .send({ preferences: newPreferences })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /register-user', () => {
    const validUserData = {
      username: 'testuser',
      password: 'password123',
      therapistId: 'therapist123',
      hand: 'Right'
    };

    it('should register a new user successfully', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.prototype.save.mockResolvedValue({});

      const response = await request(app)
        .post('/register-user')
        .send(validUserData)
        .expect(201);

      expect(response.body).toEqual({ message: 'User registered successfully!' });
    });

    it('should handle database errors during registration', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.prototype.save.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/register-user')
        .send(validUserData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle bcrypt errors', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      const response = await request(app)
        .post('/register-user')
        .send(validUserData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});
