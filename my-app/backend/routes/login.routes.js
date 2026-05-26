const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const router  = express.Router();

const User    = require("../models/User");

/* =========================
   ROUTE LOADED CHECK
========================= */

console.log("✅ LOGIN ROUTES LOADED");

/* =========================
   TEST GET ROUTE
========================= */

router.get("/login", (req, res) => {

  res.status(200).json({

    success: true,

    message: "Login route working"

  });

});

/* =========================
   LOGIN ROUTE
========================= */

router.post("/login", async (req, res) => {

  try {

    console.log("✅ LOGIN API HIT");

    console.log("BODY:", req.body);

    const { email, password } = req.body;

    /* =========================
       VALIDATION
    ========================= */

    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: "Email and password required"

      });

    }

    /* =========================
       FIND USER
    ========================= */

    const user = await User.findOne({

      email: email.toLowerCase()

    });

    if (!user) {

      return res.status(400).json({

        success: false,

        message: "User not found"

      });

    }

    /* =========================
       CHECK PASSWORD
    ========================= */

    const isMatch = await bcrypt.compare(

      password,
      user.password

    );

    if (!isMatch) {

      return res.status(400).json({

        success: false,

        message: "Invalid credentials"

      });

    }

    /* =========================
       BLOCK CHECK
    ========================= */

    if (user.isBlocked) {

      return res.status(403).json({

        success: false,

        message:
          "Your account has been blocked. Please contact support."

      });

    }

    /* =========================
       GENERATE TOKEN
    ========================= */

    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }

    );

    /* =========================
       SUCCESS RESPONSE
    ========================= */

    return res.status(200).json({

      success: true,

      message: "Login successful",

      token,

      user: {

        _id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        isBlocked: user.isBlocked,

        isApproved: user.isApproved,

        isRejected: user.isRejected,

        registrationCompleted:
          user.registrationCompleted

      }

    });

  } catch (error) {

    console.log("❌ LOGIN ERROR:", error);

    return res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

});

module.exports = router;