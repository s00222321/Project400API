// __tests__/models/Therapist.test.js
const mongoose = require('mongoose');
const Therapist = require('../../models/Therapist');

describe('Therapist Model', () => {
  describe('Schema', () => {
    it('should have required username field with unique constraint', () => {
      const username = Therapist.schema.obj.username;
      expect(username).toBeDefined();
      expect(username.type).toBe(String);
      expect(username.required).toBe(true);
      expect(username.unique).toBe(true);
    });

    it('should have required password field', () => {
      const password = Therapist.schema.obj.password;
      expect(password).toBeDefined();
      expect(password.type).toBe(String);
      expect(password.required).toBe(true);
    });

    it('should have required email field with unique constraint', () => {
      const email = Therapist.schema.obj.email;
      expect(email).toBeDefined();
      expect(email.type).toBe(String);
      expect(email.required).toBe(true);
      expect(email.unique).toBe(true);
    });
  });

  describe('Validation', () => {
    let validTherapistData;

    beforeEach(() => {
      validTherapistData = {
        username: 'testtherapist',
        password: 'password123',
        email: 'therapist@example.com'
      };
    });

    it('should validate a correct therapist document', () => {
      const therapist = new Therapist(validTherapistData);
      const err = therapist.validateSync();
      expect(err).toBeUndefined();
    });

    it('should be invalid if username is empty', () => {
      const therapist = new Therapist({
        ...validTherapistData,
        username: ''
      });
      const err = therapist.validateSync();
      expect(err.errors.username).toBeDefined();
      expect(err.errors.username.kind).toBe('required');
    });

    it('should be invalid if username is missing', () => {
      const { username, ...therapistWithoutUsername } = validTherapistData;
      const therapist = new Therapist(therapistWithoutUsername);
      const err = therapist.validateSync();
      expect(err.errors.username).toBeDefined();
      expect(err.errors.username.kind).toBe('required');
    });

    it('should be invalid if password is empty', () => {
      const therapist = new Therapist({
        ...validTherapistData,
        password: ''
      });
      const err = therapist.validateSync();
      expect(err.errors.password).toBeDefined();
      expect(err.errors.password.kind).toBe('required');
    });

    it('should be invalid if password is missing', () => {
      const { password, ...therapistWithoutPassword } = validTherapistData;
      const therapist = new Therapist(therapistWithoutPassword);
      const err = therapist.validateSync();
      expect(err.errors.password).toBeDefined();
      expect(err.errors.password.kind).toBe('required');
    });

    it('should be invalid if email is empty', () => {
      const therapist = new Therapist({
        ...validTherapistData,
        email: ''
      });
      const err = therapist.validateSync();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.email.kind).toBe('required');
    });

    it('should be invalid if email is missing', () => {
      const { email, ...therapistWithoutEmail } = validTherapistData;
      const therapist = new Therapist(therapistWithoutEmail);
      const err = therapist.validateSync();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.email.kind).toBe('required');
    });
  });

  describe('Unique Constraints', () => {
    it('should have unique index for username', () => {
      const usernameIndex = Therapist.schema.indexes().find(
        index => index[0].username === 1
      );
      expect(usernameIndex).toBeDefined();
    });

    it('should have unique index for email', () => {
      const emailIndex = Therapist.schema.indexes().find(
        index => index[0].email === 1
      );
      expect(emailIndex).toBeDefined();
    });
  });

  describe('Model Methods', () => {
    it('should create model name correctly', () => {
      expect(Therapist.modelName).toBe('Therapist');
    });

    it('should create new therapist instance correctly', () => {
      const therapistData = {
        username: 'testtherapist',
        password: 'password123',
        email: 'therapist@example.com'
      };
      const therapist = new Therapist(therapistData);
      
      expect(therapist.username).toBe(therapistData.username);
      expect(therapist.password).toBe(therapistData.password);
      expect(therapist.email).toBe(therapistData.email);
    });
  });

  describe('Document Methods', () => {
    it('should convert to JSON correctly', () => {
      const therapistData = {
        username: 'testtherapist',
        password: 'password123',
        email: 'therapist@example.com'
      };
      const therapist = new Therapist(therapistData);
      const json = therapist.toJSON();
      
      expect(json).toHaveProperty('username', therapistData.username);
      expect(json).toHaveProperty('email', therapistData.email);
      expect(json).toHaveProperty('password', therapistData.password);
    });
  });
});
