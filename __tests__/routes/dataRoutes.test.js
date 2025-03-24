// __tests__/routes/dataRoutes.test.js
const request = require('supertest');
const express = require('express');
const { spawn } = require('child_process');
const dataRoutes = require('../../routes/dataRoutes');
const Action = require('../../models/Action');
const { validateAction } = require('../../models/validation');
const authenticateToken = require('../../middleware/authMiddleware');

// Mock the dependencies
jest.mock('../../models/Action');
jest.mock('../../models/validation');
jest.mock('../../middleware/authMiddleware');
jest.mock('child_process');

const app = express();
app.use(express.json());
app.use('/', dataRoutes);

describe('Data Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticateToken to pass through
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 'testUserId' };
      next();
    });
  });

  describe('POST /save-action', () => {
    const validActionData = {
      timestamp: new Date().toISOString(),
      reactionTime: 500,
      finger: 'index',
      hand: 'Right',
      gameMode: 'practice'
    };

    it('should save action successfully', async () => {
      validateAction.mockReturnValue({ error: null });
      const mockSavedAction = { ...validActionData, _id: 'testId' };
      Action.prototype.save.mockResolvedValue(mockSavedAction);

      const response = await request(app)
        .post('/save-action')
        .send(validActionData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Action saved successfully',
        data: mockSavedAction
      });
    });

    it('should return 400 for invalid action data', async () => {
      validateAction.mockReturnValue({
        error: { details: [{ message: 'Invalid data' }] }
      });

      const response = await request(app)
        .post('/save-action')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid data' });
    });

    it('should handle database save errors', async () => {
      validateAction.mockReturnValue({ error: null });
      Action.prototype.save.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/save-action')
        .send(validActionData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Error saving action',
        error: 'Database error'
      });
    });

    it('should handle authentication failure', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/save-action')
        .send(validActionData)
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('GET /get-actions/:userId', () => {
    it('should fetch actions for specific user', async () => {
      const mockActions = [
        { userId: 'testUserId', reactionTime: 500 },
        { userId: 'testUserId', reactionTime: 600 }
      ];
      Action.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockActions)
      });

      const response = await request(app)
        .get('/get-actions/testUserId')
        .expect(200);

      expect(response.body).toEqual({ data: mockActions });
    });

    it('should handle database query errors', async () => {
      Action.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/get-actions/testUserId')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Error fetching actions',
        error: 'Database error'
      });
    });

    it('should handle empty results', async () => {
      Action.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/get-actions/testUserId')
        .expect(200);

      expect(response.body).toEqual({ data: [] });
    });
  });

  describe('GET /get-actions', () => {
    it('should fetch actions for authenticated user', async () => {
      const mockActions = [
        { userId: 'testUserId', reactionTime: 500 },
        { userId: 'testUserId', reactionTime: 600 }
      ];
      Action.find.mockResolvedValue(mockActions);

      const response = await request(app)
        .get('/get-actions')
        .expect(200);

      expect(response.body).toEqual({ data: mockActions });
      expect(Action.find).toHaveBeenCalledWith({ userId: 'testUserId' });
    });

    it('should handle database query errors', async () => {
      Action.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/get-actions')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Error fetching actions',
        error: 'Database error'
      });
    });

    it('should handle authentication failure', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/get-actions')
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('GET /trends/:userId', () => {
    it('should return processed data from Python script', async () => {
      const mockPythonProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      };

      spawn.mockReturnValue(mockPythonProcess);

      // Simulate successful Python script execution
      const mockData = { trend: 'improving' };
      
      // Trigger the stdout data event
      mockPythonProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify(mockData));
        }
      });

      // Trigger the close event
      mockPythonProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
      });

      const response = await request(app)
        .get('/trends/testUserId')
        .expect(200);

      expect(response.body).toEqual(mockData);
    });

    it('should handle Python script errors', async () => {
      const mockPythonProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      };

      spawn.mockReturnValue(mockPythonProcess);

      // Simulate Python script error
      mockPythonProcess.stderr.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('Python script error');
        }
      });

      mockPythonProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('');
        }
      });

      mockPythonProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1);
        }
      });

      const response = await request(app)
        .get('/trends/testUserId')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to process data' });
    });

    it('should handle invalid JSON output from Python script', async () => {
      const mockPythonProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      };

      spawn.mockReturnValue(mockPythonProcess);

      // Simulate invalid JSON output
      mockPythonProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback('invalid json');
        }
      });

      mockPythonProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
      });

      const response = await request(app)
        .get('/trends/testUserId')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to process data' });
    });
  });
});
