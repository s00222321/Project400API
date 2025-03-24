// __tests__/models/Action.test.js
const mongoose = require('mongoose');
const Action = require('../../models/Action');

describe('Action Model', () => {
  describe('Schema', () => {
    it('should have required userId field', () => {
      const userId = Action.schema.obj.userId;
      expect(userId).toBeDefined();
      expect(userId.type).toBe(String);
      expect(userId.required).toBe(true);
    });

    it('should have timestamp field with default value', () => {
      const timestamp = Action.schema.obj.timestamp;
      expect(timestamp).toBeDefined();
      expect(timestamp.type).toBe(Date);
      expect(timestamp.default).toBeDefined();
    });

    it('should have required reactionTime field', () => {
      const reactionTime = Action.schema.obj.reactionTime;
      expect(reactionTime).toBeDefined();
      expect(reactionTime.type).toBe(Number);
      expect(reactionTime.required).toBe(true);
    });

    it('should have required finger field', () => {
      const finger = Action.schema.obj.finger;
      expect(finger).toBeDefined();
      expect(finger.type).toBe(String);
      expect(finger.required).toBe(true);
    });

    it('should have required hand field with enum values', () => {
      const hand = Action.schema.obj.hand;
      expect(hand).toBeDefined();
      expect(hand.type).toBe(String);
      expect(hand.required).toBe(true);
      expect(hand.enum).toEqual(["Right", "Left"]);
    });

    it('should have required gameMode field', () => {
      const gameMode = Action.schema.obj.gameMode;
      expect(gameMode).toBeDefined();
      expect(gameMode.type).toBe(String);
      expect(gameMode.required).toBe(true);
    });
  });

  describe('Validation', () => {
    let validActionData;

    beforeEach(() => {
      validActionData = {
        userId: 'testUserId',
        timestamp: new Date(),
        reactionTime: 500,
        finger: 'index',
        hand: 'Right',
        gameMode: 'practice'
      };
    });

    it('should validate a correct action document', () => {
      const action = new Action(validActionData);
      const err = action.validateSync();
      expect(err).toBeUndefined();
    });

    it('should be invalid if userId is empty', () => {
      const action = new Action({ ...validActionData, userId: '' });
      const err = action.validateSync();
      expect(err.errors.userId).toBeDefined();
    });

    it('should be invalid if reactionTime is missing', () => {
      const { reactionTime, ...actionWithoutReactionTime } = validActionData;
      const action = new Action(actionWithoutReactionTime);
      const err = action.validateSync();
      expect(err.errors.reactionTime).toBeDefined();
    });

    it('should be invalid if finger is missing', () => {
      const { finger, ...actionWithoutFinger } = validActionData;
      const action = new Action(actionWithoutFinger);
      const err = action.validateSync();
      expect(err.errors.finger).toBeDefined();
    });

    it('should be invalid if hand is not "Right" or "Left"', () => {
      const action = new Action({ ...validActionData, hand: 'Invalid' });
      const err = action.validateSync();
      expect(err.errors.hand).toBeDefined();
    });

    it('should accept both "Right" and "Left" as valid hand values', () => {
      const rightHand = new Action({ ...validActionData, hand: 'Right' });
      const leftHand = new Action({ ...validActionData, hand: 'Left' });
      
      expect(rightHand.validateSync()).toBeUndefined();
      expect(leftHand.validateSync()).toBeUndefined();
    });

    it('should be invalid if gameMode is missing', () => {
      const { gameMode, ...actionWithoutGameMode } = validActionData;
      const action = new Action(actionWithoutGameMode);
      const err = action.validateSync();
      expect(err.errors.gameMode).toBeDefined();
    });

    it('should set default timestamp if not provided', () => {
      const { timestamp, ...actionWithoutTimestamp } = validActionData;
      const action = new Action(actionWithoutTimestamp);
      expect(action.timestamp).toBeDefined();
      expect(action.timestamp instanceof Date).toBe(true);
    });
  });

  describe('Model Methods', () => {
    it('should create model name correctly', () => {
      expect(Action.modelName).toBe('Action');
    });
  });
});
