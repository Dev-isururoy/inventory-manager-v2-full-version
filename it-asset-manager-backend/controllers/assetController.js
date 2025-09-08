// controllers/assetController.js
const Asset = require("../models/Asset");

// GET /api/assets?page=1&limit=10&search=...&type=PC&status=Active
exports.getAssets = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.max(parseInt(req.query.limit || "10"), 1);
    const { search, type, status } = req.query;

    // build filter
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      const s = search.trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { assetCode: { $regex: s, $options: "i" } },
        { assignedTo: { $regex: s, $options: "i" } },
        { department: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, assets] = await Promise.all([
      Asset.countDocuments(filter),
      Asset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    res.json({
      data: assets,
      total,
      page,
      pages,
      limit,
    });
  } catch (err) {
    console.error("getAssets error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/assets/:id
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (err) {
    console.error("getAsset error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/assets
exports.createAsset = async (req, res) => {
  try {
    const asset = new Asset(req.body);
    const newAsset = await asset.save();
    res.status(201).json(newAsset);
  } catch (err) {
    console.error("createAsset error:", err);
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/assets/:id
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (err) {
    console.error("updateAsset error:", err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("deleteAsset error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/assets/stats
exports.getStats = async (req, res) => {
  try {
    const [
      total,
      totalPCs,
      totalPrinters,
      totalCCTV,
      totalOther,
      active,
      inactive,
    ] = await Promise.all([
      Asset.countDocuments({}),
      Asset.countDocuments({ type: "PC" }),
      Asset.countDocuments({ type: "Printer" }),
      Asset.countDocuments({ type: "CCTV" }),
      Asset.countDocuments({ type: "Other" }),
      Asset.countDocuments({ status: "Active" }),
      Asset.countDocuments({ status: "Inactive" }),
    ]);

    res.json({
      total,
      totalPCs,
      totalPrinters,
      totalCCTV,
      totalOther,
      active,
      inactive,
    });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: err.message });
  }
};
