import express from "express";
import storeRoutes from "./store.routes.js";

const router = express.Router();

router.use("/", storeRoutes);

export default router;