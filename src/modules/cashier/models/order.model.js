import mongoose from "mongoose";

/* =========================================
   ORDER ITEM SCHEMA
========================================= */

const orderItemSchema =
  new mongoose.Schema({

    productId: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Product",

      required: true,

    },

    name: {

      type: String,

      required: true,

      trim: true,

    },

    sku: {

      type: String,

      required: true,

      trim: true,

      uppercase: true,

    },

    price: {

      type: Number,

      required: true,

      min: 0,

    },

    quantity: {

      type: Number,

      required: true,

      min: 1,

    },

    subtotal: {

      type: Number,

      required: true,

      min: 0,

    },

  });

/* =========================================
   ORDER SCHEMA
========================================= */

const orderSchema =
  new mongoose.Schema(

    {

      orderNumber: {

        type: String,

        unique: true,

      },

      items: [

        orderItemSchema

      ],

      subtotal: {

        type: Number,

        required: true,

        min: 0,

      },

      tax: {

        type: Number,

        default: 0,

        min: 0,

      },

      discount: {

        type: Number,

        default: 0,

        min: 0,

      },

      total: {

        type: Number,

        required: true,

        min: 0,

      },

      paymentMethod: {

        type: String,

        enum: [

          "Cash",

          "UPI",

          "Card",

        ],

        required: true,

      },

      paymentStatus: {

        type: String,

        enum: [

          "Pending",

          "Paid",

          "Failed",

        ],

        default: "Paid",

      },

      cashierName: {

        type: String,

        default: "Cashier",

      },

      notes: {

        type: String,

        default: "",

      },

    },

    {

      timestamps: true,

    }

  );

/* =========================================
   AUTO ORDER NUMBER
========================================= */

orderSchema.pre(

  "save",

  function () {

    // GENERATE ORDER NUMBER

    if (
      !this.orderNumber
    ) {

      const random =
        Math.floor(

          100000 +
          Math.random() *
          900000

        );

      this.orderNumber =
        `ORD-${random}`;

    }

  }

);

/* =========================================
   EXPORT
========================================= */

const Order =
  mongoose.model(
    "Order",
    orderSchema
  );

export default Order;