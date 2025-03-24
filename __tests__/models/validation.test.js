const {
    validateLogin,
    validateRegister,
    validateAction,
    validatePreferences
  } = require('../../models/validation');
  
  describe('Validation Module', () => {
    describe('validateLogin', () => {
      it('should validate correct login data', () => {
        const validData = {
          username: 'testuser',
          password: 'password123'
        };
        const { error } = validateLogin(validData);
        expect(error).toBeUndefined();
      });
  
      it('should reject empty username', () => {
        const invalidData = {
          username: '',
          password: 'password123'
        };
        const { error } = validateLogin(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('username');
      });
  
      it('should reject empty password', () => {
        const invalidData = {
          username: 'testuser',
          password: ''
        };
        const { error } = validateLogin(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('password');
      });
  
      it('should reject missing fields', () => {
        const invalidData = {};
        const { error } = validateLogin(invalidData);
        expect(error).toBeDefined();
      });
  
      it('should reject null values', () => {
        const invalidData = {
          username: null,
          password: null
        };
        const { error } = validateLogin(invalidData);
        expect(error).toBeDefined();
      });
  
      it('should reject non-string values', () => {
        const invalidData = {
          username: 123,
          password: true
        };
        const { error } = validateLogin(invalidData);
        expect(error).toBeDefined();
      });
    });
  
    describe('validateRegister', () => {
      it('should validate correct registration data', () => {
        const validData = {
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com'
        };
        const { error } = validateRegister(validData);
        expect(error).toBeUndefined();
      });
  
      it('should reject invalid email', () => {
        const invalidData = {
          username: 'testuser',
          password: 'password123',
          email: 'invalid-email'
        };
        const { error } = validateRegister(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('email');
      });
  
      it('should reject missing email', () => {
        const invalidData = {
          username: 'testuser',
          password: 'password123'
        };
        const { error } = validateRegister(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('email');
      });
  
      it('should reject empty strings', () => {
        const invalidData = {
          username: '',
          password: '',
          email: ''
        };
        const { error } = validateRegister(invalidData);
        expect(error).toBeDefined();
      });
  
      it('should reject null values', () => {
        const invalidData = {
          username: null,
          password: null,
          email: null
        };
        const { error } = validateRegister(invalidData);
        expect(error).toBeDefined();
      });
  
      it('should validate complex email addresses', () => {
        const validData = {
          username: 'testuser',
          password: 'password123',
          email: 'test.user+label@sub.example.com'
        };
        const { error } = validateRegister(validData);
        expect(error).toBeUndefined();
      });
    });
  
    describe('validateAction', () => {
      it('should validate correct action data', () => {
        const validData = {
          timestamp: new Date().toISOString(),
          reactionTime: 500,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
        const { error } = validateAction(validData);
        expect(error).toBeUndefined();
      });
  
      it('should set default timestamp when not provided', () => {
        const dataWithoutTimestamp = {
          reactionTime: 500,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
  
        const { error, value } = validateAction(dataWithoutTimestamp);
        
        expect(error).toBeUndefined();
        expect(value.timestamp).toBeDefined();
        expect(value.timestamp instanceof Date).toBeTruthy();
        expect(Date.now() - value.timestamp.getTime()).toBeLessThan(1000);
      });
  
      it('should accept data with and without timestamp', () => {
        const withTimestamp = {
          timestamp: new Date(),
          reactionTime: 500,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
  
        const withoutTimestamp = {
          reactionTime: 500,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
  
        const result1 = validateAction(withTimestamp);
        const result2 = validateAction(withoutTimestamp);
  
        expect(result1.error).toBeUndefined();
        expect(result2.error).toBeUndefined();
        expect(result2.value.timestamp).toBeDefined();
      });
  
      it('should use current time as default timestamp', () => {
        const beforeTest = new Date();
        
        const dataWithoutTimestamp = {
          reactionTime: 500,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
  
        const { value } = validateAction(dataWithoutTimestamp);
        const afterTest = new Date();
  
        expect(value.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
        expect(value.timestamp.getTime()).toBeLessThanOrEqual(afterTest.getTime());
      });
  
      it('should reject invalid timestamp', () => {
        const invalidData = {
          timestamp: 'invalid-date',
          reactionTime: 500,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
        const { error } = validateAction(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('timestamp');
      });
  
      it('should reject negative reaction time', () => {
        const invalidData = {
          timestamp: new Date().toISOString(),
          reactionTime: -100,
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
        const { error } = validateAction(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('reactionTime');
      });
  
      it('should reject invalid hand value', () => {
        const invalidData = {
          timestamp: new Date().toISOString(),
          reactionTime: 500,
          finger: 'index',
          hand: 'invalid',
          gameMode: 'practice'
        };
        const { error } = validateAction(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('hand');
      });
  
      it('should accept both Left and Right hand values', () => {
        const leftHand = {
          timestamp: new Date().toISOString(),
          reactionTime: 500,
          finger: 'index',
          hand: 'Left',
          gameMode: 'practice'
        };
        const rightHand = {
          ...leftHand,
          hand: 'Right'
        };
        
        expect(validateAction(leftHand).error).toBeUndefined();
        expect(validateAction(rightHand).error).toBeUndefined();
      });
  
      it('should reject non-numeric reaction time', () => {
        const invalidData = {
          timestamp: new Date().toISOString(),
          reactionTime: 'fast',
          finger: 'index',
          hand: 'Right',
          gameMode: 'practice'
        };
        const { error } = validateAction(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('reactionTime');
      });
  
      it('should handle missing fields', () => {
        const invalidData = {
          timestamp: new Date().toISOString()
        };
        const { error } = validateAction(invalidData);
        expect(error).toBeDefined();
      });
    });
  
    describe('validatePreferences', () => {
      it('should validate correct preferences data', () => {
        const validData = {
          hand: 'Right'
        };
        const { error } = validatePreferences(validData);
        expect(error).toBeUndefined();
      });
  
      it('should accept valid hand values', () => {
        const leftHand = { hand: 'Left' };
        const rightHand = { hand: 'Right' };
        
        expect(validatePreferences(leftHand).error).toBeUndefined();
        expect(validatePreferences(rightHand).error).toBeUndefined();
      });
  
      it('should reject invalid hand values', () => {
        const invalidValues = ['left', 'right', 'CENTER', ''];
        invalidValues.forEach(hand => {
          const { error } = validatePreferences({ hand });
          expect(error).toBeDefined();
          expect(error.details[0].message).toContain('hand');
        });
      });
  
      it('should reject invalid hand value', () => {
        const invalidData = {
          hand: 'invalid'
        };
        const { error } = validatePreferences(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('hand');
      });
  
      it('should handle empty object', () => {
        const { error } = validatePreferences({});
        expect(error).toBeDefined();
      });
  
      it('should reject null values', () => {
        const invalidData = {
          hand: null
        };
        const { error } = validatePreferences(invalidData);
        expect(error).toBeDefined();
      });
  
      it('should reject non-string hand values', () => {
        const invalidData = {
          hand: 123
        };
        const { error } = validatePreferences(invalidData);
        expect(error).toBeDefined();
      });
    });
  });
  