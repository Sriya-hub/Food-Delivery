const express = require("express");
const router = express.Router();

const Log = require("../models/Log");

/* =========================
   GET ALL LOGS
========================= */
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(500);

    res.status(200).json(logs);
  } catch (err) {
    console.error("Fetch Logs Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
      error: err.message,
    });
  }
});

/* =========================
   CREATE LOG (OPTIONAL)
========================= */
router.post("/", async (req, res) => {
  try {
    const { user, role, action, status } = req.body;

    const log = await Log.create({
      user,
      role,
      action,
      status,
    });

    res.status(201).json({
      success: true,
      log,
    });
  } catch (err) {
    console.error("Create Log Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create log",
      error: err.message,
    });
  }
});

module.exports = router;