import {

  sendResetOtpService,

  resetPasswordService,

} from "../services/forgotPassword.service.js";

/* =========================================
   SEND RESET OTP
========================================= */

export const sendResetOtp =
  async (req, res) => {

    try {

      /* =========================================
         GET EMAIL
      ========================================= */

      const { email } =
        req.body;

      console.log(
        "📩 Forgot Password Email:",
        email
      );

      /* =========================================
         VALIDATION
      ========================================= */

      if (!email) {

        return res.status(400).json({

          success: false,

          message:
            "Email is required",

        });

      }

      /* =========================================
         SEND OTP
      ========================================= */

      await sendResetOtpService(
        email
      );

      /* =========================================
         SUCCESS
      ========================================= */

      return res.status(200).json({

        success: true,

        message:
          "OTP sent successfully",

      });

    } catch (err) {

      /* =========================================
         DEBUG ERROR
      ========================================= */

      console.log(
        "❌ SEND OTP ERROR:",
        err
      );

      return res.status(400).json({

        success: false,

        message:
          err.message ||

          "Failed to send OTP",

      });

    }

  };

/* =========================================
   RESET PASSWORD
========================================= */

export const resetPassword =
  async (req, res) => {

    try {

      /* =========================================
         GET DATA
      ========================================= */

      const {

        email,

        otp,

        password,

      } = req.body;

      console.log({

        email,

        otp,

      });

      /* =========================================
         VALIDATION
      ========================================= */

      if (

        !email ||

        !otp ||

        !password

      ) {

        return res.status(400).json({

          success: false,

          message:
            "All fields required",

        });

      }

      /* =========================================
         RESET PASSWORD
      ========================================= */

      await resetPasswordService(

        email,

        otp,

        password

      );

      /* =========================================
         SUCCESS
      ========================================= */

      return res.status(200).json({

        success: true,

        message:
          "Password updated successfully",

      });

    } catch (err) {

      /* =========================================
         DEBUG ERROR
      ========================================= */

      console.log(
        "❌ RESET PASSWORD ERROR:",
        err
      );

      return res.status(400).json({

        success: false,

        message:
          err.message ||

          "Password reset failed",

      });

    }

  };