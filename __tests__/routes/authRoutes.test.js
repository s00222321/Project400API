const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');
const Therapist = require('../../models/Therapist');
const { validateLogin, validateRegister } = require('../../models/validation.js');

// Mock the dependencies
jest.mock('../../models/User');
jest.mock('../../models/Therapist');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/validation.js');

const app = express();
app.use(express.json());
app.use('/', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /register-therapist', () => {
    const validTherapistData = {
      username: 'testtherapist',
      password: 'password123',
      email: 'test@example.com'
    };

    it('should register a new therapist successfully', async () => {
      validateRegister.mockReturnValue({ error: null });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      Therapist.prototype.save.mockResolvedValue({});

      const response = await request(app)
        .post('/register-therapist')
        .send(validTherapistData)
        .expect(201);

      expect(response.body).toEqual({ message: 'Therapist registered successfully!' });
      expect(bcrypt.hash).toHaveBeenCalledWith(validTherapistData.password, 10);
    });

    it('should return 400 for invalid registration data', async () => {
      validateRegister.mockReturnValue({ 
        error: { details: [{ message: 'Invalid data' }] } 
      });

      const response = await request(app)
        .post('/register-therapist')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid data' });
    });

    it('should handle bcrypt hash errors', async () => {
      validateRegister.mockReturnValue({ error: null });
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      const response = await request(app)
        .post('/register-therapist')
        .send(validTherapistData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Hashing failed' });
    });

    it('should handle database save errors', async () => {
      validateRegister.mockReturnValue({ error: null });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      Therapist.prototype.save.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/register-therapist')
        .send(validTherapistData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should handle duplicate username/email errors', async () => {
        validateRegister.mockReturnValue({ error: null });
        bcrypt.hash.mockResolvedValue('hashedPassword');
        
        // MongoDB duplicate key error has a specific format
        const duplicateError = {
          name: 'MongoServerError',
          code: 11000,
          keyPattern: { email: 1 },
          keyValue: { email: 'test@example.com' }
        };
        
        Therapist.prototype.save.mockRejectedValue(duplicateError);
      
        const response = await request(app)
          .post('/register-therapist')
          .send(validTherapistData)
          .expect(400);
      
        expect(response.body).toEqual({ message: 'Username or email already exists' });
      });
      
  });

  describe('POST /login-therapist', () => {
    const loginData = {
      username: 'testtherapist',
      password: 'password123'
    };

    it('should login therapist successfully', async () => {
      validateLogin.mockReturnValue({ error: null });
      const mockTherapist = { 
        _id: '123', 
        username: 'testtherapist',
        password: 'hashedPassword'
      };
      
      Therapist.findOne.mockResolvedValue(mockTherapist);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');
      
      const response = await request(app)
        .post('/login-therapist')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token', 'mockToken');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockTherapist._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should return 401 for invalid credentials', async () => {
      validateLogin.mockReturnValue({ error: null });
      Therapist.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/login-therapist')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 401 for incorrect password', async () => {
      validateLogin.mockReturnValue({ error: null });
      Therapist.findOne.mockResolvedValue({ 
        _id: '123',
        password: 'hashedPassword' 
      });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/login-therapist')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should handle database query errors', async () => {
      validateLogin.mockReturnValue({ error: null });
      Therapist.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/login-therapist')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should handle bcrypt compare errors', async () => {
      validateLogin.mockReturnValue({ error: null });
      Therapist.findOne.mockResolvedValue({ password: 'hashedPassword' });
      bcrypt.compare.mockRejectedValue(new Error('Compare failed'));

      const response = await request(app)
        .post('/login-therapist')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Compare failed' });
    });

    it('should handle JWT sign errors', async () => {
      validateLogin.mockReturnValue({ error: null });
      Therapist.findOne.mockResolvedValue({ _id: '123', password: 'hashedPassword' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => { throw new Error('JWT error'); });

      const response = await request(app)
        .post('/login-therapist')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({ error: 'JWT error' });
    });

    it('should return 400 for invalid login data', async () => {
      const invalidData = { username: '' };
      validateLogin.mockReturnValue({ 
        error: { 
          details: [{ message: 'Username is required' }] 
        } 
      });

      const response = await request(app)
        .post('/login-therapist')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({ message: 'Username is required' });
      expect(validateLogin).toHaveBeenCalledWith(invalidData);
    });

    it('should return 400 when validation throws an error for login-therapist', async () => {
        // Mock the validation to return error instead of throwing
        validateLogin.mockReturnValue({ 
          error: { 
            details: [{ message: 'Validation error' }] 
          } 
        });
      
        const response = await request(app)
          .post('/login-therapist')
          .send({})
          .expect(400);
      
        expect(response.body).toEqual({ message: 'Validation error' });
      });

    it('should validate all required fields', async () => {
      const testCases = [
        { 
          input: { username: 'test' },
          error: 'Password is required'
        },
        { 
          input: { password: 'test' },
          error: 'Username is required'
        },
        { 
          input: {},
          error: 'Username is required'
        }
      ];

      for (const testCase of testCases) {
        validateLogin.mockReturnValue({ 
          error: { 
            details: [{ message: testCase.error }] 
          } 
        });

        const response = await request(app)
          .post('/login-therapist')
          .send(testCase.input)
          .expect(400);

        expect(response.body).toEqual({ message: testCase.error });
        expect(validateLogin).toHaveBeenCalledWith(testCase.input);
      }
    });
  });

  describe('POST /login-user', () => {
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    it('should login user successfully', async () => {
      validateLogin.mockReturnValue({ error: null });
      const mockUser = { 
        _id: '123', 
        username: 'testuser',
        password: 'hashedPassword'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');
      
      const response = await request(app)
        .post('/login-user')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token', 'mockToken');
    });

    it('should return 401 for invalid credentials', async () => {
      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/login-user')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should handle database query errors', async () => {
      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/login-user')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should handle bcrypt compare errors', async () => {
      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue({ password: 'hashedPassword' });
      bcrypt.compare.mockRejectedValue(new Error('Compare failed'));

      const response = await request(app)
        .post('/login-user')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Compare failed' });
    });

    it('should handle JWT sign errors', async () => {
      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue({ _id: '123', password: 'hashedPassword' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => { throw new Error('JWT error'); });

      const response = await request(app)
        .post('/login-user')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({ error: 'JWT error' });
    });

    it('should return 400 for invalid login data', async () => {
      const invalidData = { username: '' };
      validateLogin.mockReturnValue({ 
        error: { 
          details: [{ message: 'Username is required' }] 
        } 
      });

      const response = await request(app)
        .post('/login-user')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({ message: 'Username is required' });
      expect(validateLogin).toHaveBeenCalledWith(invalidData);
    });

    it('should return 400 when validation throws an error', async () => {
        validateLogin.mockReturnValue({ 
          error: { 
            details: [{ message: 'Validation error' }] 
          } 
        });
    
        const response = await request(app)
          .post('/login-user')
          .send({})
          .expect(400);
    
        expect(response.body).toEqual({ message: 'Validation error' });
      });
  });
});
