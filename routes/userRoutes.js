const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import the middleware
const User = require('../models/User');

// Get user details (Protected route)
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude the password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user preferences (Protected route)
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

// Update user preferences (Protected route)
router.put('/preferences', authenticateToken, async (req, res) => {
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

module.exports = router;
