import express from "express";
import staffRoutes from "./staff.routes.js";

const router = express.Router();

// 🔥 attach staff routes
router.use("/", staffRoutes);

export default router;