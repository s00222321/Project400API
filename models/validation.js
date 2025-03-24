const Joi = require("joi");

// Joi validation for Action Schema
const actionValidationSchema = Joi.object({
  timestamp: Joi.date().default(() => new Date()),
  reactionTime: Joi.number().required().min(0), // Reaction time must be a non-negative number
  finger: Joi.string().required(),
  hand: Joi.string().valid("Right", "Left").required(),
  gameMode: Joi.string().required(),
});

// Joi validation for Preferences Schema
const preferencesValidationSchema = Joi.object({
  hand: Joi.string().valid("Left", "Right").required(),
  calibration: Joi.number().default(1).min(0),
});

// Joi validation for login
const loginValidationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Joi validation for register
const registerValidationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

module.exports = {
  validateAction: (data) => actionValidationSchema.validate(data),
  validateLogin: (data) => loginValidationSchema.validate(data),
  validatePreferences: (data) => preferencesValidationSchema.validate(data),
  validateRegister: (data) => registerValidationSchema.validate(data),
};
