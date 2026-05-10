import express from "express";
import settingsController from "../controllers/settings.controller.js";

const router = express.Router();

// ✅ GET settings
router.get("/", settingsController.getSettings);

// 🔥 UPDATE settings
router.put("/", settingsController.updateSettings);

export default router;