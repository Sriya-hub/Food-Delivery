import express from "express";

import registerRoutes
from "./register.routes.js";

import loginRoutes
from "./login.routes.js";

import forgotPasswordRoutes
from "./forgotPassword.routes.js";

const router =
  express.Router();

/* =========================================
   DEBUG
========================================= */

console.log(
  "✅ Auth Routes Initialized"
);

/* =========================================
   HEALTH CHECK
========================================= */

router.get(

  "/",

  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "Auth API Working",

    });

  }

);

/* =========================================
   REGISTER ROUTES
========================================= */

router.use(

  "/register",

  registerRoutes

);

/* =========================================
   LOGIN ROUTES
========================================= */

router.use(

  "/login",

  loginRoutes

);

/* =========================================
   FORGOT PASSWORD ROUTES
========================================= */

router.use(

  "/",

  forgotPasswordRoutes

);

/* =========================================
   EXPORT
========================================= */

export default router;