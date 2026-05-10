import mongoose from "mongoose";

const supplyRequestSchema =
  new mongoose.Schema(

    {
      /* ======================================
         PRODUCT DETAILS
      ====================================== */

      product_id: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Product",

        required: true
      },

      product_name: {

        type: String,

        required: true,

        trim: true
      },

      sku: {

        type: String,

        required: true,

        trim: true
      },

      /* ======================================
         REQUEST DETAILS
      ====================================== */

      quantity: {

        type: Number,

        required: true,

        min: 1
      },

      notes: {

        type: String,

        default: "",

        trim: true
      },

      /* ======================================
         VENDOR DETAILS
      ====================================== */

      vendor_name: {

        type: String,

        required: true,

        default: "Main Vendor"
      },

      requested_by: {

        type: String,

        required: true,

        default: "Vendor"
      },

      /* ======================================
         STATUS
      ====================================== */

      status: {

        type: String,

        enum: [

          "Pending",

          "Approved",

          "Rejected",

          "Shipped",

          "Delivered"
        ],

        default: "Pending"
      },

      /* ======================================
         ADMIN RESPONSE
      ====================================== */

      admin_response: {

        type: String,

        default: ""
      },

      approved_quantity: {

        type: Number,

        default: 0
      }

    },

    {
      timestamps: true
    }
  );

/* ======================================
   EXPORT
====================================== */

export default mongoose.model(
  "SupplyRequest",
  supplyRequestSchema
);