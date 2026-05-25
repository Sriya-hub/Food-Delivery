const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const User    = require("../models/User");

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");          // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/* =========================
   MERCHANT REGISTRATION
========================= */
router.put(
  "/register/:id",
  upload.single("restaurantImage"),   // ← handles the file field
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      /* TEXT FIELDS */
      user.restaurantName    = req.body.restaurantName;
      user.phoneNumber       = req.body.phoneNumber;
      user.restaurantAddress = req.body.restaurantAddress;
      user.restaurantType    = req.body.restaurantType;
      user.openingTime       = req.body.openingTime;
      user.closingTime       = req.body.closingTime;

      /* IMAGE — save relative path if uploaded */
      if (req.file) {
        user.restaurantImage = `/uploads/${req.file.filename}`;
      }

      /* STATUS */
      user.registrationCompleted = true;
      user.isApproved            = false;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Merchant Registration Submitted",
        user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

/* =========================
   GET APPROVED RESTAURANTS
========================= */
router.get("/approved-restaurants", async (req, res) => {
  try {
    const restaurants = await User.find({
      role: "merchant",
      registrationCompleted: true,
      isApproved: true,
    })
      .select("_id restaurantName restaurantType restaurantAddress openingTime closingTime phoneNumber restaurantImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalRestaurants: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Approved Restaurant Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* =========================
   GET SINGLE MERCHANT
========================= */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id restaurantName restaurantType restaurantAddress openingTime closingTime phoneNumber restaurantImage isApproved"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;