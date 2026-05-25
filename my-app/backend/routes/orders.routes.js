const express = require("express");

const router = express.Router();

/* =========================
   GET MERCHANT ORDERS
========================= */

router.get(
  "/merchant/:merchantId",

  async (req, res) => {

    try {

      const { merchantId } = req.params;

      res.status(200).json({

        success: true,

        merchantId,

        orders: []

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);

module.exports = router;