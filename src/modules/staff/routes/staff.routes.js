import express from "express";
import staffController from "../controllers/staff.controller.js";

const router = express.Router();

router.get("/", staffController.getStaff);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);     // ✅ REQUIRED
router.delete("/:id", staffController.deleteStaff); // ✅ REQUIRED

export default router;