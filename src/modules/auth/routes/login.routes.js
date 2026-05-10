import express from "express";

import loginController
from "../controllers/login.controller.js";

const router =
  express.Router();

/* ================= LOGIN ================= */

router.post(
  "/",

  loginController.login
);

/* ================= EXPORT ================= */

export default router;