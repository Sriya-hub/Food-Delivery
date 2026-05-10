import multer from "multer";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file
    ) => ({

      folder:
        "omniretail-products",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],

      public_id:
        Date.now() +
        "-" +
        file.originalname
          .split(".")[0],

    }),

  });

export const upload =
  multer({

    storage,

    limits: {

      fileSize:
        5 * 1024 * 1024,

    },

    fileFilter: (
      req,
      file,
      cb
    ) => {

      if (
        file.mimetype.startsWith(
          "image/"
        )
      ) {

        cb(null, true);

      }

      else {

        cb(
          new Error(
            "Only image files are allowed"
          ),
          false
        );

      }

    },

  });