import express from "express";

import {

  sendResetOtp,

  resetPassword,

} from "../controllers/forgotPassword.controller.js";

const router =
  express.Router();

/* =========================================
   SEND RESET OTP
========================================= */

router.post(

  "/send-reset-otp",

  sendResetOtp

);

/* =========================================
   RESET PASSWORD
========================================= */

router.post(

  "/reset-password",

  resetPassword

);

/* =========================================
   EXPORT
========================================= */

export default router;