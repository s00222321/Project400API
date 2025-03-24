// __tests__/routes/therapistRoutes.test.js
const request = require('supertest');
const express = require('express');
const therapistRoutes = require('../../routes/therapistRoutes');
const Therapist = require('../../models/Therapist');
const authenticateToken = require('../../middleware/authMiddleware');

// Mock the dependencies
jest.mock('../../models/Therapist');
jest.mock('../../middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use('/', therapistRoutes);

describe('Therapist Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticateToken to pass through with a test user ID
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 'testTherapistId' };
      next();
    });
  });

  describe('GET /therapist', () => {
    it('should return therapist details when found', async () => {
      const mockTherapist = {
        _id: 'testTherapistId',
        username: 'testTherapist',
        email: 'test@example.com'
      };

      // Mock the select method chain
      Therapist.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockTherapist)
      });

      const response = await request(app)
        .get('/therapist')
        .expect(200);

      expect(response.body).toEqual(mockTherapist);
      expect(Therapist.findById).toHaveBeenCalledWith('testTherapistId');
    });

    it('should return 404 when therapist not found', async () => {
      // Mock the select method chain returning null
      Therapist.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get('/therapist')
        .expect(404);

      expect(response.body).toEqual({ message: 'Therapist not found' });
    });

    it('should return 500 on database error', async () => {
      const errorMessage = 'Database error';
      // Mock the select method chain throwing an error
      Therapist.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      const response = await request(app)
        .get('/therapist')
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });

    it('should exclude password from returned therapist data', async () => {
      const mockTherapist = {
        _id: 'testTherapistId',
        username: 'testTherapist',
        email: 'test@example.com'
        // Note: no password field
      };

      // Verify select('-password') is called
      Therapist.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockTherapist)
      });

      const response = await request(app)
        .get('/therapist')
        .expect(200);

      expect(response.body).toEqual(mockTherapist);
      expect(response.body).not.toHaveProperty('password');
      
      // Verify select was called with '-password'
      expect(Therapist.findById('testTherapistId').select)
        .toHaveBeenCalledWith('-password');
    });
  });
});
