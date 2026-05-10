import express from "express";

import supplyRoutes
from "./supply.routes.js";

const router =
  express.Router();

/* ===============================
   SUPPLY ROUTES
=============================== */

router.use(
  "/",
  supplyRoutes
);

export default router;