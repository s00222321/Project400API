const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const { validateLogin, validateRegister } = require('../models/validation.js');

// Therapist sign-up
router.post('/register-therapist', async (req, res) => {
    // Validate login data
    const { error } = validateRegister(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const therapist = new Therapist({ username, password: hashedPassword, email });
        await therapist.save();
        res.status(201).json({ message: 'Therapist registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Therapist login
router.post('/login-therapist', async (req, res) => {
    // Validate login data
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { username, password } = req.body;
    try {
        const user = await Therapist.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User register
router.post('/register-user', async (req, res) => {
    // Validate login data
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User login
router.post('/login-user', async (req, res) => {
    // Validate login data
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
