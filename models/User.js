const mongoose = require('mongoose');

const PreferencesSchema = new mongoose.Schema({
    hand: { type: String, enum: ['Left', 'Right'], default: 'Right' },
    calibration: { type: Number, default: 1 },
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    therapistId: { type: String, required: true },
    preferences: {  type: PreferencesSchema, default: () => ({}) },
});

module.exports = mongoose.model('User', UserSchema);
