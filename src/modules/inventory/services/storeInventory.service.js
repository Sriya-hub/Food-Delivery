import StoreInventory from "../models/storeInventory.model.js";

import Store from "../../stores/models/store.model.js";

import Product from "../../products/models/product.model.js";

/* =========================================
   ASSIGN PRODUCT TO STORE
========================================= */

export const assignProductToStore =
  async (data) => {

    try {

      const {
        store,
        product,
        quantity,
        lowStockLimit,
      } = data;

      /* =====================================
         VALIDATION
      ===================================== */

      if (!store || !product) {

        throw new Error(
          "Store and Product are required"
        );

      }

      /* =====================================
         CHECK STORE EXISTS
      ===================================== */

      const storeExists =
        await Store.findById(store);

      if (!storeExists) {

        throw new Error(
          "Store not found"
        );

      }

      /* =====================================
         CHECK PRODUCT EXISTS
      ===================================== */

      const productExists =
        await Product.findById(product);

      if (!productExists) {

        throw new Error(
          "Product not found"
        );

      }

      /* =====================================
         CHECK EXISTING INVENTORY
      ===================================== */

      const existingInventory =
        await StoreInventory.findOne({

          store,
          product,

        });

      /* =====================================
         UPDATE EXISTING
      ===================================== */

      if (existingInventory) {

        existingInventory.quantity +=
          Number(quantity || 0);

        if (lowStockLimit !== undefined) {

          existingInventory.lowStockLimit =
            Number(lowStockLimit);

        }

        await existingInventory.save();

        return existingInventory;

      }

      /* =====================================
         CREATE NEW INVENTORY
      ===================================== */

      const inventory =
        await StoreInventory.create({

          store,

          product,

          quantity:
            Number(quantity || 0),

          lowStockLimit:
            Number(lowStockLimit || 10),

        });

      return inventory;

    }

    catch (err) {

      console.log(
        "ASSIGN PRODUCT SERVICE ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   GET SINGLE STORE INVENTORY
========================================= */

export const getStoreInventory =
  async (storeId) => {

    try {

      if (!storeId) {

        throw new Error(
          "Store ID is required"
        );

      }

      const inventory =
        await StoreInventory.find({

          store: storeId,

        })

        .populate({
          path: "product",
        })

        .populate({
          path: "store",
        })

        .sort({
          createdAt: -1,
        });

      return inventory;

    }

    catch (err) {

      console.log(
        "GET STORE INVENTORY ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   GET ALL INVENTORY
========================================= */

export const getAllInventory =
  async () => {

    try {

      const inventory =
        await StoreInventory.find()

        .populate({
          path: "product",
        })

        .populate({
          path: "store",
        })

        .sort({
          createdAt: -1,
        });

      return inventory;

    }

    catch (err) {

      console.log(
        "GET ALL INVENTORY ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   UPDATE INVENTORY QUANTITY
========================================= */

export const updateInventoryQuantity =
  async (
    inventoryId,
    quantity
  ) => {

    try {

      if (!inventoryId) {

        throw new Error(
          "Inventory ID is required"
        );

      }

      const inventory =
        await StoreInventory.findById(
          inventoryId
        );

      if (!inventory) {

        throw new Error(
          "Inventory not found"
        );

      }

      inventory.quantity =
        Number(quantity);

      await inventory.save();

      return inventory;

    }

    catch (err) {

      console.log(
        "UPDATE INVENTORY ERROR:",
        err
      );

      throw err;

    }

  };