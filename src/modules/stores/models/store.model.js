import mongoose from "mongoose";

/* =========================================
   STORE SCHEMA
========================================= */

const storeSchema = new mongoose.Schema(
  {
    // 🔥 UNIQUE STORE CODE
    store_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // 🔥 STORE NAME
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 LOCATION
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 ADDRESS
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 PINCODE
    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 STATE
    state: {
      type: String,
      trim: true,
    },

    // 🔥 ACTIVE STATUS
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================
   INDEXES
========================================= */

storeSchema.index({ store_code: 1 });

storeSchema.index({ name: 1 });

/* =========================================
   EXPORT MODEL
========================================= */

const Store = mongoose.model("Store", storeSchema);

export default Store;