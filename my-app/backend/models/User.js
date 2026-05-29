const mongoose = require("mongoose");

/* ── Delivery Address sub-schema ── */
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    /* ── BASIC INFO ── */
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    /* ── ROLE ── */
    role: {
      type: String,
      enum: ["customer", "merchant", "delivery", "admin"],
      required: true,
    },

    /* ── CUSTOMER CONTACT ── */
    phoneNumber: { type: String, default: "" },
    deliveryAddresses: {
      type: [addressSchema],
      default: [],
    },

    /* ── MERCHANT DETAILS ── */
    restaurantName: { type: String, default: "" },
    restaurantAddress: { type: String, default: "" },
    restaurantType: { type: String, default: "" },
    restaurantImage: { type: String, default: "" },
    openingTime: { type: String, default: "" },
    closingTime: { type: String, default: "" },

    /* ── GEO LOCATION ── */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },

    /* ── ONLINE / OFFLINE TOGGLE ── */
    isOnline: { type: Boolean, default: false },

    /* ── TABLE RESERVATION ── */
    tableReservationEnabled: {
      type: Boolean,
      default: false,
    },

    totalTables: {
      type: Number,
      default: null,
    },

    maxGuestsPerTable: {
      type: Number,
      default: null,
    },

    reservationSlotDuration: {
      type: Number,
      default: 60,
    },

    advanceBookingDays: {
      type: Number,
      default: 7,
    },

    /* ── APPROVAL & STATUS ── */
    registrationCompleted: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isRejected: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ── GEO INDEX ── */
userSchema.index({
  location: "2dsphere",
});

module.exports = mongoose.model("User", userSchema);