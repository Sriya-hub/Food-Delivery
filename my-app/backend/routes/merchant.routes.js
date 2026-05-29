const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const User = require("../models/User");

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      unique +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const allowed =
      /jpeg|jpg|png|webp/;

    if (
      allowed.test(
        path
          .extname(
            file.originalname
          )
          .toLowerCase()
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed"
        )
      );
    }
  },
});

/* =========================
   MERCHANT REGISTRATION
========================= */
router.put(
  "/register/:id",
  upload.single(
    "restaurantImage"
  ),

  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      user.restaurantName =
        req.body.restaurantName;

      user.phoneNumber =
        req.body.phoneNumber;

      user.restaurantAddress =
        req.body.restaurantAddress;

      user.restaurantType =
        req.body.restaurantType;

      user.openingTime =
        req.body.openingTime;

      user.closingTime =
        req.body.closingTime;

      /* =========================
         GEO CODING
      ========================= */

      try {
        const address =
          encodeURIComponent(
            req.body
              .restaurantAddress
          );

        const geoResponse =
          await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1`,
            {
              headers: {
                "User-Agent":
                  "FoodieApp/1.0",
              },
            }
          );

        if (
          geoResponse.data &&
          geoResponse.data
            .length > 0
        ) {
          const lat =
            parseFloat(
              geoResponse
                .data[0].lat
            );

          const lon =
            parseFloat(
              geoResponse
                .data[0].lon
            );

          user.location = {
            type: "Point",

            coordinates: [
              lon,
              lat,
            ],
          };
        }
      } catch (geoError) {
        console.error(
          "Geocoding Error:",
          geoError.message
        );
      }

      if (req.file) {
        user.restaurantImage =
          `/uploads/${req.file.filename}`;
      }

      user.registrationCompleted =
        true;

      user.isApproved =
        false;

      await user.save();

      res.status(200).json({
        success: true,

        message:
          "Merchant Registration Submitted",

        user,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

/* =========================
   GET APPROVED RESTAURANTS
========================= */
router.get(
  "/approved-restaurants",
  async (req, res) => {
    try {
      const restaurants =
        await User.find({
          role: "merchant",

          registrationCompleted:
            true,

          isApproved: true,
        })
          .select(
            "_id restaurantName restaurantType restaurantAddress openingTime closingTime phoneNumber restaurantImage tableReservationEnabled isOnline location"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,

        totalRestaurants:
          restaurants.length,

        restaurants,
      });
    } catch (error) {
      console.error(
        "Approved Restaurant Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

/* =========================
   GET SINGLE MERCHANT
========================= */
router.get(
  "/:id",
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        ).select(
          "_id restaurantName restaurantType restaurantAddress openingTime closingTime phoneNumber restaurantImage isApproved tableReservationEnabled isOnline location"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "Merchant not found",
        });
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

module.exports = router;