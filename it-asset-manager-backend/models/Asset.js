// models/Asset.js
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "PC",
      "Printer",
      "CCTV",
      "Access Control",
      "Access Point",
      "IP Phone",
      "Analog Phone",
      "Portable Hard Disk",
      "Pen Drive",
      "Network Video Recorder (NVR)",
      "PBX",
      "Server",
      "NAS",
      "Network Switch"
    ],
    required: true
  },
  status: { type: String, default: "Active" },
  assetCode: String,
  serial: String,
  department: String,
  assignedTo: String,
  location: String
});

module.exports = mongoose.model("Asset", assetSchema);
