import Order
from "../models/order.model.js";

import Product
from "../../products/models/product.model.js";

/* =========================================
   PRODUCT STATUS
========================================= */

const getProductStatus = (
  stock
) => {

  if (stock <= 0) {

    return "Out of Stock";

  }

  if (stock < 10) {

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
         VALIDATE STOCK
      ===================================== */

      for (const item of items) {

        const product =

          await Product.findById(
            item._id
          );

        /* PRODUCT NOT FOUND */

        if (!product) {

          throw new Error(

            `${item.name} not found`

          );

        }

        /* OUT OF STOCK */

        if (product.stock <= 0) {

          throw new Error(

            `${product.name} is out of stock`

          );

        }

        /* INVALID QUANTITY */

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

          product.stock

        ) {

          throw new Error(

            `Only ${product.stock} stock available for ${product.name}`

          );

        }

      }

      /* =====================================
         UPDATE STOCK
      ===================================== */

      for (const item of items) {

        const product =

          await Product.findById(
            item._id
          );

        /* REDUCE STOCK */

        product.stock =

          Number(product.stock) -

          Number(item.qty);

        /* NEVER NEGATIVE */

        if (product.stock < 0) {

          product.stock = 0;

        }

        /* UPDATE STATUS */

        product.status =

          getProductStatus(
            product.stock
          );

        await product.save();

      }

      /* =====================================
         FORMAT ITEMS
      ===================================== */

      const formattedItems =

        items.map((item) => ({

          productId:
            item._id,

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

          /* ORDER STATUS */

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
   GET ALL ORDERS
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