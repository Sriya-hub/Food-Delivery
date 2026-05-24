const express = require("express");

const router = express.Router();

const User =
  require("../models/User");

/* =========================
   GET ALL MERCHANTS
========================= */

router.get(
  "/merchants",

  async (req, res) => {

    try {

      const merchants =
        await User.find({

          role: "merchant",

          registrationCompleted: true,
        });

      res.status(200).json(
        merchants
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);

/* =========================
   APPROVE MERCHANT
========================= */

router.put(
  "/approve/:id",

  async (req, res) => {

    try {

      const merchant =
        await User.findById(
          req.params.id
        );

      if (!merchant) {

        return res.status(404).json({
          message:
            "Merchant not found",
        });
      }

      merchant.isApproved = true;

      await merchant.save();

      res.status(200).json({

        message:
          "Merchant Approved",
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

/* =========================
   REJECT MERCHANT
========================= */

router.put(
  "/reject/:id",

  async (req, res) => {

    try {

      const merchant =
        await User.findById(
          req.params.id
        );

      if (!merchant) {

        return res.status(404).json({
          message:
            "Merchant not found",
        });
      }

      merchant.isApproved = false;

      merchant.registrationCompleted =
        false;

      await merchant.save();

      res.status(200).json({

        message:
          "Merchant Rejected",
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