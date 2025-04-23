const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reactionTime: { type: Number, required: true }, 
  finger: { type: String, required: true }, 
  hand: { type: String, required: true, enum: ["Right", "Left"] },
  gameMode: { type: String, required: true },
});

module.exports = mongoose.model("Action", actionSchema);
