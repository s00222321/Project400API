const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Action = require("../models/Action");
const { validateAction } = require('../models/validation');
const { spawn } = require("child_process");

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
router.get("/get-actions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch actions from database and sort by 'timestamp' in descending order
    const actions = await Action.find({ userId }).sort({ timestamp: -1 });

    res.status(200).json({ data: actions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching actions", error: err.message });
  }
});

// Fetch all actions from database
router.get("/get-actions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const actions = await Action.find({ userId });
    res.status(200).json({ data: actions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching actions", error: err.message });
  }
});

router.get("/trends/:userId", async (req, res) => {
  const { userId } = req.params;

  // Spawn the Python process with the userId as an argument
  const python = spawn("python", ["./scripts/trends.py", userId]);

  let dataString = "";

  python.stdout.on("data", (data) => {
    dataString += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
  });

    python.on("close", (code) => {
        try {
            const parsedData = JSON.parse(dataString.trim());
            res.status(200).json(parsedData);
        } catch (error) {
            console.error("Error parsing Python output:", error);
            res.status(500).json({ error: "Failed to process data" });
        }
    });
});

module.exports = router;
