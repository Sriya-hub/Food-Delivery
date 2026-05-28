const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    /* ── Who booked ── */
    customerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    /* ── Which restaurant ── */
    restaurantId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    /* ── Booking details ── */
    date:   { type: String, required: true }, // "YYYY-MM-DD"
    time:   { type: String, required: true }, // "HH:MM"
    guests: { type: Number, required: true, min: 1 },
    note:   { type: String, default: "" },

    /* ── Status ── */
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);