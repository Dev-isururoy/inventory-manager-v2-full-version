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
      "NVR",
      "PBX",
      "Server",
      "NAS",
      "Network Switch",
      "Laptop",
      "Laptop"
    ],
    required: true
  },
  status: { type: String, default: "Active" },
  assetCode: String,
  serial: String,
  department: String,
  assignedTo: String,
  location: String,

  // NEW FIELDS
  ipAddress: String,
  network: String,
});

module.exports = mongoose.model("Asset", assetSchema);
