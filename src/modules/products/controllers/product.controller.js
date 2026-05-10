import {

  getProducts as getProductsService,

  addProduct as addProductService,

  updateProduct as updateProductService,

  deleteProduct as deleteProductService,

  getProductBySku as getProductBySkuService,

} from "../services/product.service.js";

/* =========================================
   GET PRODUCTS
========================================= */

export const getProducts =
  async (search = "") => {

    try {

      const products =

        await getProductsService(
          search
        );

      return products;

    }

    catch (err) {

      console.log(
        "GET PRODUCTS CONTROLLER ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   ADD PRODUCT
========================================= */

export const addProduct =
  async (data, file) => {

    try {

      const product =

        await addProductService(
          data,
          file
        );

      return product;

    }

    catch (err) {

      console.log(
        "ADD PRODUCT CONTROLLER ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   UPDATE PRODUCT
========================================= */

export const updateProduct =
  async (

    id,

    data,

    file

  ) => {

    try {

      const product =

        await updateProductService(

          id,

          data,

          file

        );

      return product;

    }

    catch (err) {

      console.log(
        "UPDATE PRODUCT CONTROLLER ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   DELETE PRODUCT
========================================= */

export const deleteProduct =
  async (id) => {

    try {

      const product =

        await deleteProductService(
          id
        );

      return product;

    }

    catch (err) {

      console.log(
        "DELETE PRODUCT CONTROLLER ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   GET PRODUCT BY SKU
========================================= */

export const getProductBySku =
  async (sku) => {

    try {

      const product =

        await getProductBySkuService(
          sku
        );

      return product;

    }

    catch (err) {

      console.log(
        "GET PRODUCT SKU CONTROLLER ERROR:",
        err
      );

      throw err;

    }

  };