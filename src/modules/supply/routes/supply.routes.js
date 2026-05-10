import express from "express";

import {

  getRequests,

  createRequest,

  updateRequestStatus,

  deleteRequest

} from "../controllers/supply.controller.js"

const router =
  express.Router();

/* =================================================
   GET ALL SUPPLY REQUESTS
================================================= */

router.get(
  "/",
  getRequests
);

/* =================================================
   CREATE NEW SUPPLY REQUEST
================================================= */

router.post(
  "/",
  createRequest
);

/* =================================================
   UPDATE REQUEST STATUS
================================================= */

router.put(
  "/:id/status",
  updateRequestStatus
);

/* =================================================
   DELETE REQUEST
================================================= */

router.delete(
  "/:id",
  deleteRequest
);

export default router;