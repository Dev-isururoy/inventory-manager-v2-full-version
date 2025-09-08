// routes/assetRoutes.js
const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");

// stats must come before :id to avoid being treated as an id
router.get("/stats", assetController.getStats);

// list (supports pagination & filters)
router.get("/", assetController.getAssets);

// single, create, update, delete
router.get("/:id", assetController.getAsset);
router.post("/", assetController.createAsset);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);

module.exports = router;
