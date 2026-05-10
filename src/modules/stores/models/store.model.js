import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // 🔥 HUMAN-READABLE UNIQUE CODE (STR001)
    store_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    // 🔥 STORE NAME
    name: {
      type: String,
      required: true,
      trim: true
    },

    // 🔥 LOCATION (CITY / AREA)
    location: {
      type: String,
      required: true,
      trim: true
    },

    // 🔥 FULL ADDRESS
    address: {
      type: String,
      required: true,
      trim: true
    },

    // 🔥 PINCODE
    pincode: {
      type: String,
      required: true,
      trim: true
    },

    // 🔥 STATE
    state: {
      type: String,
      trim: true
    },

    // 🔥 OPTIONAL: ACTIVE FLAG (for future scaling)
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// 🔥 INDEX FOR FAST SEARCH
storeSchema.index({ store_code: 1 });
storeSchema.index({ name: 1 });

export default mongoose.model("Store", storeSchema);