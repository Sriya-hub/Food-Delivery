/* ==============================================
   ADD THESE ROUTES TO YOUR merchantRoutes.js
   (paste before module.exports = router)
   ============================================== */

const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const User    = require("../models/User");

/* ── Multer (reuse same config as registration) ── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error("Images only"));
  },
});

/* ==============================================
   GET /api/merchant/settings/:id
   Returns full merchant profile for Settings page
   ============================================== */
router.get("/settings/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id name email restaurantName restaurantAddress restaurantType " +
      "phoneNumber restaurantImage openingTime closingTime " +
      "isOnline isApproved registrationCompleted createdAt"
    );

    if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

    res.status(200).json({ success: true, merchant: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ==============================================
   PUT /api/merchant/settings/:id
   Update editable fields + optional new image
   ============================================== */
router.put(
  "/settings/:id",
  upload.single("restaurantImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

      /* Only update fields that were sent */
      const allowed = [
        "restaurantName", "phoneNumber", "restaurantAddress",
        "restaurantType", "openingTime", "closingTime",
      ];
      allowed.forEach(f => {
        if (req.body[f] !== undefined) user[f] = req.body[f];
      });

      if (req.file) user.restaurantImage = `/uploads/${req.file.filename}`;

      await user.save();
      res.status(200).json({ success: true, message: "Settings updated", merchant: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

/* ==============================================
   PATCH /api/merchant/settings/:id/online
   Toggle isOnline status only
   ============================================== */
router.patch("/settings/:id/online", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Merchant not found" });

    user.isOnline = req.body.isOnline;   // true | false
    await user.save();

    res.status(200).json({ success: true, isOnline: user.isOnline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;