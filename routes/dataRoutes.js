const express = require("express");
const router = express.Router();
const Action = require("../models/Action");

// Save action to database
router.post("/save-action", async (req, res) => {
  const { userId, action, timestamp } = req.body;

  try {
    const newAction = new Action({ userId, action, timestamp });
    const savedAction = await newAction.save();
    res.status(201).json({ message: "Action saved successfully", data: savedAction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving action", error: err.message });
  }
});

// Fetch all actions from database
router.get("/get-actions", async (req, res) => {
  try {
    const actions = await Action.find();
    res.status(200).json({ data: actions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching actions", error: err.message });
  }
});

module.exports = router;
