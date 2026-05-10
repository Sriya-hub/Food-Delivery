import Order
from "../models/order.model.js";

import Product
from "../../products/models/product.model.js";

import StoreInventory
from "../../inventory/models/storeInventory.model.js";

/* =========================================
   INVENTORY STATUS
========================================= */

const getInventoryStatus =
  (qty, limit = 10) => {

    if (qty <= 0) {

      return "Out of Stock";

    }

    if (qty < limit) {

      return "Low Stock";

    }

    return "Active";

  };

/* =========================================
   CREATE ORDER
========================================= */

export const createOrder =
  async (data) => {

    try {

      const {

        items,

        subtotal,

        tax,

        discount = 0,

        total,

        paymentMethod,

        paymentStatus = "Paid",

        orderStatus = "Completed",

        cashierName = "Cashier",

        cashierId = "N/A",

        storeId = null,

        storeName = "Main Branch",

        notes = "",

      } = data;

      /* =====================================
         VALIDATION
      ===================================== */

      if (

        !items ||

        !Array.isArray(items) ||

        items.length === 0

      ) {

        throw new Error(
          "Cart is empty"
        );

      }

      /* =====================================
         VALIDATE INVENTORY
      ===================================== */

      for (const item of items) {

        const inventory =

          await StoreInventory

          .findById(
            item.inventory_id
          )

          .populate("product");

        /* NOT FOUND */

        if (!inventory) {

          throw new Error(

            `${item.name} not found`

          );

        }

        /* PRODUCT */

        const product =
          inventory.product;

        /* OUT OF STOCK */

        if (

          inventory.quantity <= 0

        ) {

          throw new Error(

            `${product.name} is out of stock`

          );

        }

        /* INVALID QTY */

        if (

          !item.qty ||

          item.qty <= 0

        ) {

          throw new Error(

            `Invalid quantity for ${product.name}`

          );

        }

        /* STOCK LIMIT */

        if (

          item.qty >

          inventory.quantity

        ) {

          throw new Error(

            `Only ${inventory.quantity} stock available for ${product.name}`

          );

        }

      }

      /* =====================================
         UPDATE INVENTORY
      ===================================== */

      for (const item of items) {

        const inventory =

          await StoreInventory

          .findById(
            item.inventory_id
          )

          .populate("product");

        /* REDUCE STOCK */

        inventory.quantity =

          Number(
            inventory.quantity
          ) -

          Number(item.qty);

        /* NEVER NEGATIVE */

        if (

          inventory.quantity < 0

        ) {

          inventory.quantity = 0;

        }

        /* STATUS */

        inventory.status =

          getInventoryStatus(

            inventory.quantity,

            inventory.lowStockLimit

          );

        await inventory.save();

      }

      /* =====================================
         FORMAT ITEMS
      ===================================== */

      const formattedItems =

        items.map((item) => ({

          productId:
            item.product_id,

          inventoryId:
            item.inventory_id,

          name:
            item.name,

          sku:
            item.sku,

          price:
            Number(item.price),

          quantity:
            Number(item.qty),

          subtotal:

            Number(item.price) *

            Number(item.qty),

        }));

      /* =====================================
         CREATE ORDER
      ===================================== */

      const order =
        await Order.create({

          /* ITEMS */

          items:
            formattedItems,

          itemsCount:
            formattedItems.reduce(

              (acc, item) =>

                acc + item.quantity,

              0

            ),

          /* BILLING */

          subtotal:
            Number(subtotal),

          tax:
            Number(tax),

          discount:
            Number(discount),

          total:
            Number(total),

          /* PAYMENT */

          paymentMethod,

          paymentStatus,

          /* STATUS */

          orderStatus,

          /* CASHIER */

          cashierName,

          cashierId,

          /* STORE */

          storeId,

          storeName,

          /* NOTES */

          notes,

        });

      return order;

    }

    catch (err) {

      console.log(
        "CREATE ORDER ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   GET ORDERS
========================================= */

export const getOrders =
  async () => {

    try {

      const orders =

        await Order.find()

        .sort({

          createdAt: -1,

        });

      return orders;

    }

    catch (err) {

      console.log(
        "GET ORDERS ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   GET SINGLE ORDER
========================================= */

export const getSingleOrder =
  async (id) => {

    try {

      const order =

        await Order.findById(id);

      if (!order) {

        throw new Error(
          "Order not found"
        );

      }

      return order;

    }

    catch (err) {

      console.log(
        "GET SINGLE ORDER ERROR:",
        err
      );

      throw err;

    }

  };