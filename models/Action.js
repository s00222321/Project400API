const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Action", actionSchema);
