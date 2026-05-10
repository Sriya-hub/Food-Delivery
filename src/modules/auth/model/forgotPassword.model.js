import mongoose from "mongoose";

/* =========================================
   FORGOT PASSWORD SCHEMA
========================================= */

const forgotPasswordSchema =
  new mongoose.Schema(

    {

      email: {

        type: String,

        required: true,

      },

      otp: {

        type: String,

        required: true,

      },

      expiresAt: {

        type: Date,

        required: true,

      },

    },

    {

      timestamps: true,

    }

  );

/* =========================================
   MODEL
========================================= */

const ForgotPassword =
  mongoose.model(

    "ForgotPassword",

    forgotPasswordSchema

  );

/* =========================================
   EXPORT
========================================= */

export default ForgotPassword;