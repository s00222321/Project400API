// __tests__/models/User.test.js
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model', () => {
  describe('PreferencesSchema', () => {
    it('should have correct hand field configuration', () => {
      const hand = User.schema.path('preferences.hand');
      expect(hand.instance).toBe('String');
      expect(hand.options.enum).toEqual(['Left', 'Right']);
      expect(hand.options.default).toBe('Right');
    });

    it('should have correct calibration field configuration', () => {
      const calibration = User.schema.path('preferences.calibration');
      expect(calibration.instance).toBe('Number');
      expect(calibration.options.default).toBe(1);
    });

    it('should set default preferences correctly', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        therapistId: 'therapist123'
      });
      expect(user.preferences).toBeDefined();
      expect(user.preferences.hand).toBe('Right');
      expect(user.preferences.calibration).toBe(1);
    });
  });

  describe('UserSchema', () => {
    it('should have required username field', () => {
      const username = User.schema.obj.username;
      expect(username).toBeDefined();
      expect(username.type).toBe(String);
      expect(username.required).toBe(true);
      expect(username.unique).toBe(true);
    });

    it('should have required password field', () => {
      const password = User.schema.obj.password;
      expect(password).toBeDefined();
      expect(password.type).toBe(String);
      expect(password.required).toBe(true);
    });

    it('should have required therapistId field', () => {
      const therapistId = User.schema.obj.therapistId;
      expect(therapistId).toBeDefined();
      expect(therapistId.type).toBe(String);
      expect(therapistId.required).toBe(true);
    });

    it('should have preferences field with PreferencesSchema type', () => {
      const preferences = User.schema.obj.preferences;
      expect(preferences).toBeDefined();
      expect(preferences.type).toBeDefined();
      expect(preferences.default).toBeDefined();
    });
  });

  describe('Validation', () => {
    let validUserData;

    beforeEach(() => {
      validUserData = {
        username: 'testuser',
        password: 'password123',
        therapistId: 'therapist123'
      };
    });

    it('should validate a correct user document', () => {
      const user = new User(validUserData);
      const err = user.validateSync();
      expect(err).toBeUndefined();
    });

    it('should be invalid if username is empty', () => {
      const user = new User({
        ...validUserData,
        username: ''
      });
      const err = user.validateSync();
      expect(err.errors.username).toBeDefined();
    });

    it('should be invalid if password is empty', () => {
      const user = new User({
        ...validUserData,
        password: ''
      });
      const err = user.validateSync();
      expect(err.errors.password).toBeDefined();
    });

    it('should be invalid if therapistId is empty', () => {
      const user = new User({
        ...validUserData,
        therapistId: ''
      });
      const err = user.validateSync();
      expect(err.errors.therapistId).toBeDefined();
    });

    it('should accept valid hand values in preferences', () => {
      const validHandValues = ['Left', 'Right'];
      validHandValues.forEach(hand => {
        const user = new User({
          ...validUserData,
          preferences: { hand }
        });
        const err = user.validateSync();
        expect(err).toBeUndefined();
      });
    });

    it('should reject invalid hand values in preferences', () => {
      const user = new User({
        ...validUserData,
        preferences: { hand: 'Invalid' }
      });
      const err = user.validateSync();
      expect(err.errors['preferences.hand']).toBeDefined();
    });

    it('should accept valid calibration values', () => {
      const user = new User({
        ...validUserData,
        preferences: { calibration: 2.5 }
      });
      const err = user.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('Default Values', () => {
    it('should set default preferences when not provided', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        therapistId: 'therapist123'
      });
      expect(user.preferences.hand).toBe('Right');
      expect(user.preferences.calibration).toBe(1);
    });

    it('should allow overriding default preferences', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        therapistId: 'therapist123',
        preferences: {
          hand: 'Left',
          calibration: 2
        }
      });
      expect(user.preferences.hand).toBe('Left');
      expect(user.preferences.calibration).toBe(2);
    });

    it('should maintain default values when partial preferences provided', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        therapistId: 'therapist123',
        preferences: {
          hand: 'Left'
          // calibration not provided
        }
      });
      expect(user.preferences.hand).toBe('Left');
      expect(user.preferences.calibration).toBe(1);
    });
  });

  describe('Model Methods', () => {
    it('should create model name correctly', () => {
      expect(User.modelName).toBe('User');
    });
  });
});
