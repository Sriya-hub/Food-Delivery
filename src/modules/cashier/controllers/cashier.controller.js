import {
  createOrder,
  getOrders,
  getSingleOrder,
} from "../services/cashier.service.js";

/* =========================================
   CREATE ORDER
========================================= */

export const createCashierOrder =
  async (req, res) => {

    try {

      const order =
        await createOrder(
          req.body
        );

      return res.status(201).json({

        success: true,

        message:
          "Order created successfully",

        order,

      });

    }

    catch (err) {

      console.error(
        "CREATE ORDER ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||

          "Order creation failed",

      });

    }

  };

/* =========================================
   GET ALL ORDERS
========================================= */

export const getCashierOrders =
  async (req, res) => {

    try {

      const orders =
        await getOrders();

      return res.status(200).json({

        success: true,

        count:
          orders.length,

        orders,

      });

    }

    catch (err) {

      console.error(
        "GET ORDERS ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message,

      });

    }

  };

/* =========================================
   GET SINGLE ORDER
========================================= */

export const getCashierOrderById =
  async (req, res) => {

    try {

      const order =
        await getSingleOrder(
          req.params.id
        );

      if (!order) {

        return res.status(404).json({

          success: false,

          message:
            "Order not found",

        });

      }

      return res.status(200).json({

        success: true,

        order,

      });

    }

    catch (err) {

      console.error(
        "GET SINGLE ORDER ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message,

      });

    }

  };