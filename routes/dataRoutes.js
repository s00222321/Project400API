const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Action = require("../models/Action");
const {validateAction} = require('../models/validation');

// Save action to database
router.post("/save-action", authenticateToken, async (req, res) => {
  const { error } = validateAction(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { timestamp, reactionTime, finger, hand, gameMode } = req.body;
  const userId = req.user.id; // Extract userId from the authenticated user

  try {
    const newAction = new Action({
      userId,   
      timestamp,     
      reactionTime,    
      finger,    
      hand,           
      gameMode      
    });
    
    const savedAction = await newAction.save();
    res.status(201).json({ message: "Action saved successfully", data: savedAction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving action", error: err.message });
  }
});

// Fetch all actions from database
router.get("/get-actions", authenticateToken, async (req, res) => {
  try {
    const actions = await Action.find({ userId: req.user.id });
    res.status(200).json({ data: actions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching actions", error: err.message });
  }
});

module.exports = router;
