const express      = require("express");
const router       = express.Router();
const jwt          = require("jsonwebtoken");
const Reservation  = require("../models/Reservation");
const User         = require("../models/User");

/* =========================
   AUTH MIDDLEWARE
   Verifies the Bearer token
   and attaches req.userId
========================= */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }
  try {
    const decoded = jwt.verify(
      header.split(" ")[1],
      process.env.JWT_SECRET
    );
    req.userId = decoded.id || decoded._id || decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

/* ==============================================
   GET /api/reservations/availability
   Public — check how many tables are free
   for a given restaurant + date + time slot
   ============================================== */
router.get("/availability", async (req, res) => {
  try {
    const { restaurantId, date, time } = req.query;

    if (!restaurantId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, date and time are required",
      });
    }

    // Get total tables configured by the merchant
    const merchant = await User.findById(restaurantId).select(
      "totalTables tableReservationEnabled"
    );

    if (!merchant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    if (!merchant.tableReservationEnabled) {
      return res.status(400).json({
        success: false,
        message: "Table reservation is not enabled for this restaurant",
      });
    }

    const totalTables = merchant.totalTables || 0;

    // Count active bookings for this slot
    const booked = await Reservation.countDocuments({
      restaurantId,
      date,
      time,
      status: { $nin: ["cancelled"] },
    });

    const availableTables = Math.max(0, totalTables - booked);

    res.status(200).json({
      success:         true,
      totalTables,
      booked,
      availableTables,
    });
  } catch (err) {
    console.error("Availability check error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   POST /api/reservations
   Customer creates a reservation
   Requires auth token
   ============================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { restaurantId, date, time, guests, note } = req.body;

    if (!restaurantId || !date || !time || !guests) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, date, time and guests are required",
      });
    }

    // Verify restaurant has reservation enabled
    const merchant = await User.findById(restaurantId).select(
      "totalTables tableReservationEnabled maxGuestsPerTable restaurantName"
    );

    if (!merchant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    if (!merchant.tableReservationEnabled) {
      return res.status(400).json({
        success: false,
        message: "Table reservation is not enabled for this restaurant",
      });
    }

    // Check guest limit per table
    if (merchant.maxGuestsPerTable && guests > merchant.maxGuestsPerTable) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${merchant.maxGuestsPerTable} guests allowed per table`,
      });
    }

    // Check availability
    const totalTables = merchant.totalTables || 0;
    const booked = await Reservation.countDocuments({
      restaurantId,
      date,
      time,
      status: { $nin: ["cancelled"] },
    });

    if (booked >= totalTables) {
      return res.status(409).json({
        success: false,
        message: "No tables available for this date and time slot",
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      customerId:   req.userId,
      restaurantId,
      date,
      time,
      guests:       Number(guests),
      note:         note || "",
      status:       "pending",
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation,
    });
  } catch (err) {
    console.error("Create reservation error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   GET /api/reservations/my
   Customer views their own bookings
   Requires auth token
   ============================================== */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find({ customerId: req.userId })
      .populate("restaurantId", "restaurantName restaurantAddress restaurantImage restaurantType")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reservations });
  } catch (err) {
    console.error("Fetch my reservations error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   GET /api/reservations/merchant/:restaurantId
   Merchant views all bookings for their restaurant
   Requires auth token
   ============================================== */
router.get("/merchant/:restaurantId", authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      restaurantId: req.params.restaurantId,
    })
      .populate("customerId", "name email phoneNumber")
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, reservations });
  } catch (err) {
    console.error("Fetch merchant reservations error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   PATCH /api/reservations/:id/status
   Merchant updates booking status
   (confirmed / cancelled / completed)
   Requires auth token
   ============================================== */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    res.status(200).json({
      success: true,
      message: `Reservation marked as ${status}`,
      reservation,
    });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   DELETE /api/reservations/:id
   Customer cancels their own booking
   Requires auth token
   ============================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id:        req.params.id,
      customerId: req.userId,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found or not yours",
      });
    }

    if (reservation.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed reservation",
      });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (err) {
    console.error("Cancel reservation error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;