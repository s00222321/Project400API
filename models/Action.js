const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reactionTime: { type: Number, required: true }, // Reaction time in milliseconds
  finger: { type: String, required: true }, // Indicates which finger performed the action
  hand: { type: String, required: true, enum: ["right", "left"] }, // Indicates the hand used
  gameMode: { type: String, required: true },
});

module.exports = mongoose.model("Action", actionSchema);
