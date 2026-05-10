import express from "express";

import {

  getProducts,

  addProduct,

  updateProduct,

  deleteProduct,

  getProductBySku,

} from "../controllers/product.controller.js";

import { upload }

from "../../../middleware/upload.js";

/* =========================================
   ROUTER
========================================= */

const router =
  express.Router();

/* =========================================
   GET ALL PRODUCTS
========================================= */

router.get(

  "/",

  async (req, res) => {

    try {

      const search =
        req.query.search || "";

      const products =
        await getProducts(search);

      console.log(
        "PRODUCTS FOUND:",
        products.length
      );

      console.log(
        "PRODUCTS:",
        products
      );

      return res.status(200).json({

        success: true,

        count:
          products.length,

        products,

      });

    }

    catch (err) {

      console.log(
        "GET PRODUCTS ROUTE ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||

          "Failed to fetch products",

      });

    }

  }

);

/* =========================================
   GET PRODUCT BY SKU
========================================= */

router.get(

  "/sku/:sku",

  async (req, res) => {

    try {

      const product =
        await getProductBySku(

          req.params.sku

        );

      console.log(
        "PRODUCT FOUND:",
        product
      );

      return res.status(200).json({

        success: true,

        product,

      });

    }

    catch (err) {

      console.log(
        "GET PRODUCT BY SKU ROUTE ERROR:",
        err
      );

      return res.status(404).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

/* =========================================
   ADD PRODUCT
========================================= */

router.post(

  "/",

  upload.single("image"),

  async (req, res) => {

    try {

      const product =
        await addProduct(

          req.body,

          req.file

        );

      console.log(
        "PRODUCT CREATED:",
        product
      );

      return res.status(201).json({

        success: true,

        message:
          "Product Added Successfully",

        product,

      });

    }

    catch (err) {

      console.log(
        "ADD PRODUCT ROUTE ERROR:",
        err
      );

      return res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

/* =========================================
   UPDATE PRODUCT
========================================= */

router.put(

  "/:id",

  upload.single("image"),

  async (req, res) => {

    try {

      const product =
        await updateProduct(

          req.params.id,

          req.body,

          req.file

        );

      console.log(
        "UPDATED PRODUCT:",
        product
      );

      return res.status(200).json({

        success: true,

        message:
          "Product Updated Successfully",

        product,

      });

    }

    catch (err) {

      console.log(
        "UPDATE PRODUCT ROUTE ERROR:",
        err
      );

      return res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

/* =========================================
   DELETE PRODUCT
========================================= */

router.delete(

  "/:id",

  async (req, res) => {

    try {

      await deleteProduct(
        req.params.id
      );

      console.log(
        "PRODUCT DELETED:",
        req.params.id
      );

      return res.status(200).json({

        success: true,

        message:
          "Product Deleted Successfully",

      });

    }

    catch (err) {

      console.log(
        "DELETE PRODUCT ROUTE ERROR:",
        err
      );

      return res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

  }

);

export default router;