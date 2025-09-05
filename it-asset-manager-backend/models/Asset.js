const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  assetCode: { type: String, required: true },
  serial: { type: String, required: true },
  department: { type: String, required: true },
  assignedTo: { type: String, required: true },
  location: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);

