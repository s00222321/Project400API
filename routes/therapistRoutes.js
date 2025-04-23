const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Therapist = require('../models/Therapist');

// get user details - protected route
router.get('/therapist', authenticateToken, async (req, res) => {
    try {
        const user = await Therapist.findById(req.user.id).select('-password'); // exclude the password
        if (!user) {
            return res.status(404).json({ message: 'Therapist not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;