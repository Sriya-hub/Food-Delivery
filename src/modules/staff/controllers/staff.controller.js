import bcrypt from "bcryptjs";

import Staff from "../model/staff.model.js";

import getStaffData
from "../services/staff.service.js";

import sendStaffCredentials
from "../services/sendStaffCredentials.js";

/* ================= HELPERS ================= */

const generateUsername = (
  name
) => {

  return (
    name
      .toLowerCase()
      .replace(/\s/g, "") +

    Math.floor(
      100 + Math.random() * 900
    )
  );
};

const generatePassword = () => {

  return Math.random()
    .toString(36)
    .slice(-8);
};

/* ================= GET STAFF ================= */

const getStaff = async (
  req,
  res,
  next
) => {

  try {

    const { store_id } =
      req.query;

    const data =
      await getStaffData(
        store_id
      );

    return res.status(200).json({

      success: true,

      ...data
    });

  } catch (err) {

    console.error(
      "GET STAFF ERROR:",
      err
    );

    next(err);
  }
};

/* ================= CREATE STAFF ================= */

const createStaff = async (
  req,
  res,
  next
) => {

  try {

    let {
      name,
      email,
      role,
      status,
      shift,
      store_id
    } = req.body;

    /* ================= VALIDATION ================= */

    if (
      !name ||
      !email ||
      !store_id
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, Email and Store required"
      });
    }

    /* ================= CLEAN EMAIL ================= */

    email =
      email
        .toLowerCase()
        .trim();

    /* ================= CHECK EMAIL ================= */

    const existingEmail =
      await Staff.findOne({
        email
      });

    if (existingEmail) {

      return res.status(400).json({

        success: false,

        message:
          "Email already exists"
      });
    }

    /* ================= GENERATE USERNAME ================= */

    let username =
      generateUsername(name);

    /* ================= CHECK USERNAME ================= */

    let existingUsername =
      await Staff.findOne({
        username
      });

    while (
      existingUsername
    ) {

      username =
        generateUsername(name);

      existingUsername =
        await Staff.findOne({
          username
        });
    }

    /* ================= PASSWORD ================= */

    const rawPassword =
      generatePassword();

    const hashedPassword =
      await bcrypt.hash(
        rawPassword,
        10
      );

    /* ================= CREATE ================= */

    const staff =
      await Staff.create({

        name,

        email,

        username,

        password:
          hashedPassword,

        role:
          role || "Cashier",

        status:
          status || "Active",

        shift:
          shift || "Morning",

        store_id,

        orders: 0,

        sales: 0,

        avgOrder: 0,

        mustChangePassword: true
      });

    /* ================= SEND EMAIL ================= */

    await sendStaffCredentials({

      name,

      email,

      username,

      password:
        rawPassword,

      role:
        staff.role
    });

    /* ================= RESPONSE ================= */

    return res.status(201).json({

      success: true,

      message:
        "Staff created successfully",

      staff
    });

  } catch (err) {

    console.error(
      "CREATE STAFF ERROR:",
      err
    );

    next(err);
  }
};

/* ================= UPDATE STAFF ================= */

const updateStaff = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const updated =
      await Staff.findByIdAndUpdate(

        id,

        req.body,

        {
          new: true,
          runValidators: true
        }
      );

    if (!updated) {

      return res.status(404).json({

        success: false,

        message:
          "Staff not found"
      });
    }

    return res.status(200).json({

      success: true,

      message:
        "Staff updated successfully",

      staff: updated
    });

  } catch (err) {

    console.error(
      "UPDATE STAFF ERROR:",
      err
    );

    next(err);
  }
};

/* ================= DELETE STAFF ================= */

const deleteStaff = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const deleted =
      await Staff.findByIdAndDelete(
        id
      );

    if (!deleted) {

      return res.status(404).json({

        success: false,

        message:
          "Staff not found"
      });
    }

    return res.status(200).json({

      success: true,

      message:
        "Staff deleted permanently"
    });

  } catch (err) {

    console.error(
      "DELETE STAFF ERROR:",
      err
    );

    next(err);
  }
};

export default {

  getStaff,

  createStaff,

  updateStaff,

  deleteStaff
};