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

    /* =====================================
       VALIDATION
    ===================================== */

    if (

      !username ||

      !password

    ) {

      throw new Error(

        "Username and password required"

      );

    }

    /* =====================================
       FIND USER + STORE
    ===================================== */

    const user =

      await Staff.findOne({

        username:

          username
            .toLowerCase()
            .trim(),

        isDeleted: false,

      })

      .populate(

        "store_id",

        "name store_code address location"

      );

    /* =====================================
       USER NOT FOUND
    ===================================== */

    if (!user) {

      throw new Error(

        "Invalid credentials"

      );

    }

    /* =====================================
       ACCOUNT STATUS
    ===================================== */

    if (

      user.status !== "Active"

    ) {

      throw new Error(

        "Account is inactive"

      );

    }

    /* =====================================
       PASSWORD CHECK
    ===================================== */

    let isMatch = false;

    /* =====================================
       BCRYPT PASSWORD
    ===================================== */

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

    /* =====================================
       OLD PASSWORD
    ===================================== */

    else {

      isMatch =

        user.password ===
        password;

      /* AUTO MIGRATE */

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

    /* =====================================
       INVALID PASSWORD
    ===================================== */

    if (!isMatch) {

      throw new Error(

        "Invalid credentials"

      );

    }

    /* =====================================
       LOGIN TRACKING
    ===================================== */

    user.lastLogin =
      new Date();

    user.loginCount =

      (user.loginCount || 0) + 1;

    await user.save();

    /* =====================================
       JWT TOKEN
    ===================================== */

    const token =

      jwt.sign(

        {

          id:
            user._id,

          role:
            user.role,

          store_id:
            user.store_id?._id ||

            null,

          staff_code:
            user.staff_code,

        },

        process.env.JWT_SECRET ||

        "MY_SECRET_KEY",

        {

          expiresIn: "7d",

        }

      );

    /* =====================================
       RESPONSE
    ===================================== */

    return {

      token,

      user: {

        /* ================= IDS ================= */

        _id:
          user._id,

        staff_code:
          user.staff_code ||

          "",

        /* ================= BASIC ================= */

        name:
          user.name,

        email:
          user.email,

        username:
          user.username,

        phone:
          user.phone ||

          "",

        address:
          user.address ||

          "",

        /* ================= ROLE ================= */

        role:
          user.role,

        status:
          user.status,

        shift:
          user.shift ||

          "",

        /* ================= STORE ================= */

        store_id:
          user.store_id?._id ||

          null,

        store_code:
          user.store_id?.store_code ||

          "",

        store_name:
          user.store_id?.name ||

          "",

        store_address:
          user.store_id?.address ||

          "",

        store_location:
          user.store_id?.location ||

          "",

        /* ================= PROFILE ================= */

        profileImage:
          user.profileImage ||

          "",

        /* ================= PERFORMANCE ================= */

        orders:
          user.orders || 0,

        sales:
          user.sales || 0,

        avgOrder:
          user.avgOrder || 0,

        /* ================= SECURITY ================= */

        mustChangePassword:
          user.mustChangePassword ||

          false,

        /* ================= LOGIN ================= */

        loginCount:
          user.loginCount || 0,

        lastLogin:
          user.lastLogin || null,

      },

    };

  };

export default loginService;