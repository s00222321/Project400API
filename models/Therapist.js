const mongoose = require('mongoose');

const TherapistSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Therapist', TherapistSchema);