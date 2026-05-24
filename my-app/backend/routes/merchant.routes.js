const express = require("express");

const router = express.Router();

const User =
  require("../models/User");

/* =========================
   MERCHANT REGISTRATION
========================= */

router.put(
  "/register/:id",

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });
      }

      /* UPDATE DETAILS */

      user.restaurantName =
        req.body.restaurantName;

      user.phoneNumber =
        req.body.phoneNumber;

      user.restaurantAddress =
        req.body.restaurantAddress;

      user.restaurantType =
        req.body.restaurantType;

      user.openingTime =
        req.body.openingTime;

      user.closingTime =
        req.body.closingTime;

      user.registrationCompleted =
        true;

      user.isApproved =
        false;

      await user.save();

      res.status(200).json({

        message:
          "Merchant Registration Submitted",

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