import express from "express";
import registerController from "../controllers/register.controller.js";

const router = express.Router();

// ✅ Debug log (confirms this file is loaded)
console.log("✅ Register Routes Loaded");

// ✅ GET → browser test
router.get("/", (req, res) => {
  res.send("✅ Register route working");
});

// ✅ POST → actual register API
router.post("/", (req, res, next) => {
  console.log("📥 Incoming Register Request:", req.body); // 🔍 debug

  registerController.register(req, res, next);
});

export default router;