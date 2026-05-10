import express from "express";

import cashierRoutes
from "./cashier.routes.js";

const router =
  express.Router();

/* =========================================
   CASHIER ROUTES
========================================= */

router.use(
  "/",
  cashierRoutes
);

export default router;