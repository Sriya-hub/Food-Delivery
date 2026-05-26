const express = require("express");

const router = express.Router();

const Order = require("../models/Order");

/* =========================
   GET SINGLE ORDER
========================= */

router.get(
  "/:orderId",

  async (req, res) => {

    try {

      const { orderId } =
        req.params;

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {

        return res.status(404).json({

          success: false,

          message: "Order not found"

        });

      }

      res.status(200).json({

        success: true,

        order

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);

/* =========================
   GET MERCHANT ORDERS
========================= */

router.get(
  "/merchant/:merchantId",

  async (req, res) => {

    try {

      const { merchantId } =
        req.params;

      const orders =
        await Order.find({

          merchantId

        })
        .sort({

          createdAt: -1

        });

      res.status(200).json({

        success: true,

        merchantId,

        orders

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);

/* =========================
   UPDATE ORDER STATUS
========================= */

router.put(
  "/:orderId/status",

  async (req, res) => {

    try {

      const { orderId } =
        req.params;

      const { orderStatus } =
        req.body;

      const updatedOrder =
        await Order.findByIdAndUpdate(

          orderId,

          {
            orderStatus
          },

          {
            new: true
          }

        );

      if (!updatedOrder) {

        return res.status(404).json({

          success: false,

          message: "Order not found"

        });

      }

      res.status(200).json({

        success: true,

        order: updatedOrder

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