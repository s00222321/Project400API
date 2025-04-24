const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const { validateLogin, validateRegister } = require('../models/validation.js');

// therapist sign-up
// routes/authRoutes.js
router.post('/register-therapist', async (req, res) => {
    try {
        // validate registration data
        const { error } = validateRegister(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // create new therapist
        const therapist = new Therapist({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email
        });

        // save therapist
        await therapist.save();
        res.status(201).json({ message: 'Therapist registered successfully!' });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// therapist login
router.post('/login-therapist', async (req, res) => {
    console.log('here');
    // validate login data
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

// user login
router.post('/login-user', async (req, res) => {
    // validate login data
    console.log('here');
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
