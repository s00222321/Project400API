// __tests__/middleware/authMiddleware.test.js
const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/authMiddleware');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    mockReq = {
      header: jest.fn()
    };
    mockRes = {
      sendStatus: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should authenticate valid token', () => {
    // Setup
    const token = 'valid.jwt.token';
    const user = { id: 'testUserId' };
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, user));

    // Execute
    authenticateToken(mockReq, mockRes, mockNext);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, expect.any(Function));
    expect(mockReq.user).toEqual(user);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.sendStatus).not.toHaveBeenCalled();
  });

  it('should return 401 if no token provided', () => {
    // Setup
    mockReq.header.mockReturnValue(undefined);

    // Execute
    authenticateToken(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is empty', () => {
    // Setup
    mockReq.header.mockReturnValue('');

    // Execute
    authenticateToken(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    // Setup
    const token = 'invalid.jwt.token';
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    jwt.verify.mockImplementation((token, secret, callback) => 
      callback(new Error('Invalid token'), null)
    );

    // Execute
    authenticateToken(mockReq, mockRes, mockNext);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, expect.any(Function));
    expect(mockRes.sendStatus).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle malformed Authorization header', () => {
    // Setup
    mockReq.header.mockReturnValue('malformed-header');

    // Execute
    authenticateToken(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle Bearer prefix without token', () => {
    // Setup
    mockReq.header.mockReturnValue('Bearer ');

    // Execute
    authenticateToken(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
