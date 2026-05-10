import express from "express";
import {
  getStores,
  getStore,
  addStore,
  updateStore,
  deleteStore
} from "../controllers/store.controller.js";

const router = express.Router();

/* ================= STORE ROUTES ================= */

// GET ALL
router.get("/", getStores);

// GET ONE
router.get("/:id", getStore);

// CREATE
router.post("/", addStore);

// UPDATE
router.put("/:id", updateStore);

// DELETE
router.delete("/:id", deleteStore);

export default router;