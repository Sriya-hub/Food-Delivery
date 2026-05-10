import loginService from "../services/login.service.js";

/* ================= LOGIN ================= */

const login = async (
  req,
  res,
  next
) => {

  try {

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

    /* ================= SUCCESS ================= */

    return res.status(200).json({

      success: true,

      message:
        "Login successful",

      token:
        result.token,

      mustChangePassword:
        result.user
          .mustChangePassword,

      user: {

        _id:
          result.user._id,

        name:
          result.user.name,

        email:
          result.user.email,

        username:
          result.user.username,

        role:
          result.user.role,

        status:
          result.user.status,

        store_id:
          result.user.store_id,

        profileImage:
          result.user.profileImage
      }
    });

  } catch (err) {

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