import express from "express";
import productRoutes from "./product.routes.js";

const router = express.Router();

router.use("/", productRoutes);

export default router;