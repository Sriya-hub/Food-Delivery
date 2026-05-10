import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import Staff
from "../../staff/model/staff.model.js";

/* =========================================
   LOGIN SERVICE
========================================= */

const loginService =
  async ({

    username,

    password,

  }) => {

    /* =========================================
       VALIDATION
    ========================================= */

    if (
      !username ||
      !password
    ) {

      throw new Error(
        "Username and password required"
      );

    }

    /* =========================================
       FIND USER
    ========================================= */

    const user =
      await Staff.findOne({

        username:
          username
            .toLowerCase()
            .trim(),

        isDeleted: false,

      });

    /* =========================================
       USER NOT FOUND
    ========================================= */

    if (!user) {

      throw new Error(
        "Invalid credentials"
      );

    }

    /* =========================================
       ACCOUNT STATUS
    ========================================= */

    if (
      user.status !== "Active"
    ) {

      throw new Error(
        "Account is inactive"
      );

    }

    /* =========================================
       PASSWORD CHECK
    ========================================= */

    let isMatch = false;

    /* =========================================
       BCRYPT PASSWORD
    ========================================= */

    if (
      user.password.startsWith(
        "$2"
      )
    ) {

      isMatch =
        await bcrypt.compare(

          password,

          user.password

        );

    }

    /* =========================================
       OLD PLAIN PASSWORD
    ========================================= */

    else {

      isMatch =
        user.password ===
        password;

      /* AUTO MIGRATE TO BCRYPT */

      if (isMatch) {

        const hashedPassword =
          await bcrypt.hash(

            password,

            10

          );

        user.password =
          hashedPassword;

        await user.save();

        console.log(
          "✅ Password auto-migrated to bcrypt"
        );

      }

    }

    /* =========================================
       INVALID PASSWORD
    ========================================= */

    if (!isMatch) {

      throw new Error(
        "Invalid credentials"
      );

    }

    /* =========================================
       LOGIN TRACKING
    ========================================= */

    user.lastLogin =
      new Date();

    user.loginCount =
      (user.loginCount || 0) + 1;

    await user.save();

    /* =========================================
       JWT TOKEN
    ========================================= */

    const token =
      jwt.sign(

        {

          id: user._id,

          role: user.role,

          store_id:
            user.store_id,

        },

        process.env.JWT_SECRET ||

        "MY_SECRET_KEY",

        {

          expiresIn: "7d",

        }

      );

    /* =========================================
       RESPONSE
    ========================================= */

    return {

      token,

      user: {

        _id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        username:
          user.username,

        role:
          user.role,

        status:
          user.status,

        phone:
          user.phone,

        store_id:
          user.store_id,

        profileImage:
          user.profileImage,

        mustChangePassword:
          user.mustChangePassword,

      },

    };

  };

export default loginService;