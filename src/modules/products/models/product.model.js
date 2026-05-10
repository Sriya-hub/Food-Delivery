import mongoose from "mongoose";

/* =========================================
   PRODUCT SCHEMA
========================================= */

const productSchema = new mongoose.Schema(

  {

    /* =====================================
       PRODUCT NAME
    ===================================== */

    name: {

      type: String,

      required: true,

      trim: true,

    },

    /* =====================================
       SKU / BARCODE
    ===================================== */

    sku: {

      type: String,

      required: true,

      unique: true,

      trim: true,

      uppercase: true,

    },

    /* =====================================
       CATEGORY
    ===================================== */

    category: {

      type: String,

      required: true,

      trim: true,

    },

    /* =====================================
       BRAND
    ===================================== */

    brand: {

      type: String,

      default: "",

      trim: true,

    },

    /* =====================================
       COLOR
    ===================================== */

    color: {

      type: String,

      default: "",

      trim: true,

    },

    /* =====================================
       RAM
    ===================================== */

    ram: {

      type: String,

      default: "",

      trim: true,

    },

    /* =====================================
       STORAGE
    ===================================== */

    storage: {

      type: String,

      default: "",

      trim: true,

    },

    /* =====================================
       DESCRIPTION
    ===================================== */

    description: {

      type: String,

      default: "",

      trim: true,

    },

    /* =====================================
       PRICE
    ===================================== */

    price: {

      type: Number,

      required: true,

      min: 0,

    },

    /* =====================================
       STOCK
    ===================================== */

    stock: {

      type: Number,

      default: 0,

      min: 0,

    },

    /* =====================================
       STATUS
    ===================================== */

    status: {

      type: String,

      enum: [

        "Active",

        "Low Stock",

        "Out of Stock",

      ],

      default: "Active",

    },

    /* =====================================
       PRODUCT IMAGE
    ===================================== */

    image: {

      type: String,

      default: null,

    },

    /* =====================================
       QR / BARCODE IMAGE
    ===================================== */

    qrCode: {

      type: String,

      default: null,

    },

  },

  {

    timestamps: true,

  }

);

/* =========================================
   AUTO STATUS UPDATE
========================================= */

productSchema.pre(

  "save",

  function () {

    /* OUT OF STOCK */

    if (this.stock <= 0) {

      this.status =
        "Out of Stock";

    }

    /* LOW STOCK */

    else if (this.stock < 10) {

      this.status =
        "Low Stock";

    }

    /* ACTIVE */

    else {

      this.status =
        "Active";

    }

  }

);

/* =========================================
   EXPORT MODEL
========================================= */

const Product = mongoose.model(

  "Product",

  productSchema

);

export default Product;