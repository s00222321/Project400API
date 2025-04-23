const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const {validatePreferences} = require('../models/validation');

// get all users by therapist id
router.get('/users/:therapistId', async (req, res) => {
    try {
        const { therapistId } = req.params;
        const users = await User.find({ therapistId }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get user details - protected route
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // exclude the password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get user preferences - protected route
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.preferences);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update user preferences - protected route
router.put('/preferences', authenticateToken, async (req, res) => {
    const { error } = validatePreferences(req.body.preferences);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences: req.body.preferences },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.preferences);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// user register
router.post('/register-user', async (req, res) => {
    const { username, password, therapistId, hand} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, therapistId, preferences: { hand } });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
