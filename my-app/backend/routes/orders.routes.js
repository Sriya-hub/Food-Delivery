const express = require("express");

const mongoose = require("mongoose");

const router = express.Router();

const Order = require("../models/Order");

/* =========================================================
   GET CUSTOMER ORDERS
========================================================= */

router.get(

  "/customer/:customerId",

  async (req, res) => {

    try {

      const { customerId } =
        req.params;

      const orders =
        await Order.find({

          customerId

        })

        .sort({

          createdAt: -1

        });

      res.status(200).json({

        success: true,

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

/* =========================================================
   GET MERCHANT ORDERS
========================================================= */

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

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

router.put(

  "/:orderId/status",

  async (req, res) => {

    try {

      const { orderId } =
        req.params;

      const { orderStatus } =
        req.body;

      /* =========================
         VALIDATE ORDER ID
      ========================= */

      if (

        !mongoose.Types.ObjectId.isValid(
          orderId
        )

      ) {

        return res.status(400).json({

          success: false,

          message: "Invalid Order ID"

        });

      }

      /* =========================
         VALIDATE STATUS
      ========================= */

      const allowedStatuses = [

        "PLACED",

        "PREPARING",

        "OUT_FOR_DELIVERY",

        "DELIVERED",

        "CANCELLED"

      ];

      if (

        !allowedStatuses.includes(
          orderStatus
        )

      ) {

        return res.status(400).json({

          success: false,

          message: "Invalid order status"

        });

      }

      /* =========================
         UPDATE STATUS
      ========================= */

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

        message:
          "Order status updated",

        order:
          updatedOrder

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }

);

/* =========================================================
   GET SINGLE ORDER
========================================================= */

router.get(

  "/:orderId",

  async (req, res) => {

    try {

      const { orderId } =
        req.params;

      /* =========================
         VALIDATE ORDER ID
      ========================= */

      if (

        !mongoose.Types.ObjectId.isValid(
          orderId
        )

      ) {

        return res.status(400).json({

          success: false,

          message: "Invalid Order ID"

        });

      }

      /* =========================
         FIND ORDER
      ========================= */

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

module.exports = router;