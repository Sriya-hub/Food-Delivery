const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const Food =
  require("../models/Food");

/* =========================
   MULTER STORAGE
========================= */

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      cb(
        null,
        "uploads/"
      );
    },

    filename: function (
      req,
      file,
      cb
    ) {

      cb(

        null,

        Date.now() +

        path.extname(
          file.originalname
        )
      );
    }
  });

const upload =
  multer({
    storage
  });

/* =========================
   ADD FOOD
========================= */

router.post(

  "/add-food",

  upload.single("image"),

  async (req, res) => {

    try {

      const {

        merchantId,
        name,
        category,
        description,
        price,
        stock,
        available

      } = req.body;

      const newFood =
        new Food({

          merchantId,

          name,

          category,

          description,

          price,

          stock,

          available,

          image:
            req.file

            ? `/uploads/${req.file.filename}`

            : ""
        });

      await newFood.save();

      res.status(201).json({

        success: true,

        message:
          "Food Added Successfully",

        food: newFood
      });

    } catch (error) {

      console.log(
        "Add Food Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

/* =========================
   GET RESTAURANT FOODS
========================= */

router.get(

  "/foods/:merchantId",

  async (req, res) => {

    try {

      const { merchantId } =
        req.params;

      console.log(
        "Merchant ID:",
        merchantId
      );

      if (!merchantId) {

        return res.status(400).json({

          success: false,

          message:
            "Merchant ID Required"
        });
      }

      const foods =
        await Food.find({

          merchantId
        })

        .sort({

          createdAt: -1
        });

      res.status(200).json({

        success: true,

        totalFoods:
          foods.length,

        foods
      });

    } catch (error) {

      console.log(
        "Get Foods Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

/* =========================
   DELETE FOOD
========================= */

router.delete(

  "/delete-food/:id",

  async (req, res) => {

    try {

      await Food.findByIdAndDelete(

        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Food Deleted Successfully"
      });

    } catch (error) {

      console.log(
        "Delete Food Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error"
      });
    }
  }
);

module.exports = router;