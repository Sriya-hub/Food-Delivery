const express  = require("express");
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Order    = require("../models/Order");
const router   = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ── POST /api/checkout/create-order
   Creates a Razorpay order (ONLINE) or places a COD order directly ── */
router.post("/create-order", async (req, res) => {
  try {
    const { customerId, merchantId, items, address, paymentMethod, totalAmount } = req.body;

    if (!customerId || !merchantId || !items?.length || !address || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    if (paymentMethod === "COD") {
      const order = await Order.create({
        customerId, merchantId, items, address,
        paymentMethod: "COD", paymentStatus: "PENDING",
        orderStatus: "PLACED", totalAmount,
      });
      return res.status(201).json({ success: true, paymentMethod: "COD", orderId: order._id });
    }

    /* ONLINE — create Razorpay order */
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    });

    /* Save order as PENDING until payment verified */
    const order = await Order.create({
      customerId, merchantId, items, address,
      paymentMethod: "ONLINE", paymentStatus: "PENDING",
      orderStatus: "PLACED", totalAmount,
      razorpayOrderId: rzpOrder.id,       // store for verification
    });

    res.status(201).json({
      success:        true,
      paymentMethod:  "ONLINE",
      orderId:        order._id,
      razorpayOrderId: rzpOrder.id,
      amount:         rzpOrder.amount,
      currency:       rzpOrder.currency,
      keyId:          process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("checkout/create-order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/checkout/verify-payment
   Verifies Razorpay signature and marks order PAID ── */
router.post("/verify-payment", async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body      = razorpayOrderId + "|" + razorpayPaymentId;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "PAID",
      razorpayPaymentId,
    });

    res.json({ success: true, message: "Payment verified." });

  } catch (err) {
    console.error("checkout/verify-payment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;