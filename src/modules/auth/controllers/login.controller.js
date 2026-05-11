import loginService from "../services/login.service.js";

/* ================= LOGIN ================= */

const login = async (

  req,
  res

) => {

  try {

    /* ================= BODY ================= */

    const {

      username,
      password

    } = req.body;

    /* ================= VALIDATION ================= */

    if (

      !username ||

      !password

    ) {

      return res.status(400).json({

        success: false,

        message:
          "Username and password required"

      });

    }

    /* ================= LOGIN SERVICE ================= */

    const result =

      await loginService({

        username,
        password

      });

    /* ================= USER ================= */

    const user =
      result.user;

    /* ================= SUCCESS ================= */

    return res.status(200).json({

      success: true,

      message:
        "Login successful",

      token:
        result.token,

      mustChangePassword:
        user.mustChangePassword,

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

        /* ================= STORE ================= */

        store_id:
          user.store_id?._id ||

          user.store_id ||

          "",

        store_code:
          user.store_id?.store_code ||

          "",

        store_name:
          user.store_id?.name ||

          "",

        store_address:
          user.store_id?.address ||

          "",

        /* ================= PROFILE ================= */

        profileImage:
          user.profileImage ||

          "",

        /* ================= PASSWORD ================= */

        mustChangePassword:
          user.mustChangePassword ||

          false,

        /* ================= LOGIN TRACKING ================= */

        loginCount:
          user.loginCount ||

          0,

        lastLogin:
          user.lastLogin ||

          null,

      }

    });

  }

  catch (err) {

    console.error(

      "🔥 LOGIN ERROR:",

      err.message

    );

    return res.status(401).json({

      success: false,

      message:

        err.message ||

        "Login failed"

    });

  }

};

export default {

  login

};