const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");

/* =========================
   LOGIN ROUTE
========================= */

router.post(
  "/login",

  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      /* FIND USER */

      const user =
        await User.findOne({ email });

      if (!user) {

        return res.status(400).json({
          message: "User not found",
        });
      }

      /* CHECK PASSWORD */

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res.status(400).json({
          message:
            "Invalid Credentials",
        });
      }

      /* GENERATE TOKEN */

      const token = jwt.sign(

        {
          id: user._id,
          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

      /* RESPONSE */

      res.status(200).json({

        message:
          "Login Successful",

        token,

        user,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);

module.exports = router;