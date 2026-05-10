import bcrypt from "bcryptjs";

import axios from "axios";

import ForgotPassword
from "../model/forgotPassword.model.js";

import Staff
from "../../staff/model/staff.model.js";

/* =========================================
   SEND RESET OTP
========================================= */

export const sendResetOtpService =
  async (email) => {

    /* =========================================
       CHECK STAFF USER
    ========================================= */

    const user =
      await Staff.findOne({

        email,

        isDeleted: false,

      });

    console.log(
      "FOUND USER:",
      user
    );

    if (!user) {

      throw new Error(
        "Email not found"
      );

    }

    /* =========================================
       DELETE OLD OTP
    ========================================= */

    await ForgotPassword.deleteMany({
      email,
    });

    /* =========================================
       GENERATE OTP
    ========================================= */

    const otp =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    /* =========================================
       OTP EXPIRY
    ========================================= */

    const expiresAt =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    /* =========================================
       SAVE OTP
    ========================================= */

    await ForgotPassword.create({

      email,

      otp,

      expiresAt,

    });

    console.log(
      "✅ OTP SAVED:",
      otp
    );

    /* =========================================
       SEND EMAIL
    ========================================= */

    await axios.post(

      "https://api.brevo.com/v3/smtp/email",

      {

        sender: {

          name: "RetailHub",

          email:
            "sunkireddysubbarao994@gmail.com",

        },

        to: [
          {
            email,
          },
        ],

        subject:
          "Password Reset OTP",

        htmlContent: `

          <div
            style="
              font-family:sans-serif;
              padding:20px;
            "
          >

            <h2>
              Password Reset
            </h2>

            <p>
              Your OTP is:
            </p>

            <h1
              style="
                color:#2563eb;
                letter-spacing:4px;
              "
            >
              ${otp}
            </h1>

            <p>
              OTP valid for
              10 minutes
            </p>

          </div>

        `,

      },

      {

        headers: {

          accept:
            "application/json",

          "api-key":
            process.env.BREVO_API_KEY,

          "content-type":
            "application/json",

        },

      }

    );

    console.log(
      "✅ OTP EMAIL SENT"
    );

    return true;

  };

/* =========================================
   RESET PASSWORD
========================================= */

export const resetPasswordService =
  async (

    email,

    otp,

    password

  ) => {

    /* =========================================
       FIND OTP
    ========================================= */

    const otpRecord =
      await ForgotPassword.findOne({

        email,

        otp,

      });

    console.log(
      "OTP RECORD:",
      otpRecord
    );

    if (!otpRecord) {

      throw new Error(
        "Invalid OTP"
      );

    }

    /* =========================================
       CHECK OTP EXPIRY
    ========================================= */

    if (
      new Date() >
      otpRecord.expiresAt
    ) {

      throw new Error(
        "OTP expired"
      );

    }

    /* =========================================
       HASH PASSWORD
    ========================================= */

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    console.log(
      "HASHED PASSWORD:",
      hashedPassword
    );

    /* =========================================
       UPDATE STAFF PASSWORD
    ========================================= */

    const updatedUser =
      await Staff.findOneAndUpdate(

        {

          email,

          isDeleted: false,

        },

        {

          password:
            hashedPassword,

        },

        {

          new: true,

        }

      );

    console.log(
      "UPDATED USER:",
      updatedUser
    );

    if (!updatedUser) {

      throw new Error(
        "User not found during password update"
      );

    }

    /* =========================================
       DELETE OTP
    ========================================= */

    await ForgotPassword.deleteMany({
      email,
    });

    console.log(
      "✅ PASSWORD RESET SUCCESS"
    );

    return true;

  };