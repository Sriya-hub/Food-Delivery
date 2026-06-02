const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();
const User    = require("../models/User");
const createLog = require("../utils/createLog");

/* ══════════════════════════════════════════
   AUTH MIDDLEWARE
══════════════════════════════════════════ */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId    = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/* ══════════════════════════════════════════
   GET /profile
══════════════════════════════════════════ */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      user: {
        _id:               user._id,
        name:              user.name,
        email:             user.email,
        role:              user.role,
        phoneNumber:       user.phoneNumber,
        deliveryAddresses: user.deliveryAddresses,
        isApproved:        user.isApproved,
        isBlocked:         user.isBlocked,
      },
    });
  } catch (error) {
    console.error("❌ GET /profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ══════════════════════════════════════════
   PUT /profile
══════════════════════════════════════════ */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, deliveryAddresses } = req.body;

    const updateData = {};
    if (phoneNumber       !== undefined) updateData.phoneNumber       = phoneNumber;
    if (deliveryAddresses !== undefined) updateData.deliveryAddresses = deliveryAddresses;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await createLog({
      user:   updatedUser.name,
      role:   updatedUser.role,
      action: "Updated own profile",
      status: "Success",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        _id:               updatedUser._id,
        name:              updatedUser.name,
        email:             updatedUser.email,
        role:              updatedUser.role,
        phoneNumber:       updatedUser.phoneNumber,
        deliveryAddresses: updatedUser.deliveryAddresses,
        isApproved:        updatedUser.isApproved,
        isBlocked:         updatedUser.isBlocked,
      },
    });
  } catch (error) {
    console.error("❌ PUT /profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ══════════════════════════════════════════
   POST /profile/address
══════════════════════════════════════════ */
router.post("/profile/address", authMiddleware, async (req, res) => {
  try {
    const { label, line1, line2, city, pincode, isDefault } = req.body;
    if (!line1) return res.status(400).json({ success: false, message: "Address line 1 is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (isDefault) {
      user.deliveryAddresses.forEach(a => { a.isDefault = false; });
    }

    user.deliveryAddresses.push({ label, line1, line2, city, pincode, isDefault: !!isDefault });
    await user.save();

    await createLog({
      user:   user.name,
      role:   user.role,
      action: "Added a new delivery address",
      status: "Success",
    });

    return res.status(201).json({
      success: true,
      message: "Address added",
      deliveryAddresses: user.deliveryAddresses,
    });
  } catch (error) {
    console.error("❌ POST /profile/address error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ══════════════════════════════════════════
   DELETE /profile/address/:addressId
══════════════════════════════════════════ */
router.delete("/profile/address/:addressId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.deliveryAddresses = user.deliveryAddresses.filter(
      a => a._id.toString() !== req.params.addressId
    );
    await user.save();

    await createLog({
      user:   user.name,
      role:   user.role,
      action: "Removed a delivery address",
      status: "Success",
    });

    return res.status(200).json({
      success: true,
      message: "Address removed",
      deliveryAddresses: user.deliveryAddresses,
    });
  } catch (error) {
    console.error("❌ DELETE /profile/address error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;