import express from "express";

import {

  createCashierOrder,

  getCashierOrders,

} from "../controllers/cashier.controller.js";

const router =
  express.Router();

/* =========================================
   CREATE ORDER
========================================= */

router.post(
  "/orders",
  createCashierOrder
);

/* =========================================
   GET ALL ORDERS
========================================= */

router.get(
  "/orders",
  getCashierOrders
);

export default router;