import mongoose from "mongoose";

/* ================= ROLE CONSTANTS ================= */

export const USER_ROLES = [
  "Admin",
  "Manager",
  "Cashier",
  "Vendor"
];

/* ================= USER SCHEMA ================= */

const userSchema = new mongoose.Schema(

  {
    /* ================= BASIC INFO ================= */

    name: {
      type: String,

      required: true,

      trim: true,

      minlength: 2,

      maxlength: 50
    },

    email: {
      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true,

      match: [
        /^\S+@\S+\.\S+$/,
        "Invalid email format"
      ]
    },

    phone: {
      type: String,

      required: true,

      unique: true,

      trim: true
    },

    /* ================= LOGIN ================= */

    username: {
      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true,

      minlength: 3,

      maxlength: 30
    },

    password: {
      type: String,

      required: true,

      minlength: 6
    },

    mustChangePassword: {
      type: Boolean,

      default: true
    },

    /* ================= ROLE ================= */

    role: {
      type: String,

      enum: USER_ROLES,

      default: "Cashier"
    },

    /* ================= STATUS ================= */

    status: {
      type: String,

      enum: [
        "Active",
        "Inactive"
      ],

      default: "Active"
    },

    /* ================= STORE ================= */

    store_id: {
      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Store",

      default: null
    },

    /* ================= PROFILE ================= */

    profileImage: {
      type: String,

      default: null
    },

    address: {
      type: String,

      default: ""
    },

    /* ================= LOGIN TRACKING ================= */

    lastLogin: {
      type: Date,

      default: null
    },

    loginCount: {
      type: Number,

      default: 0
    },

    /* ================= SECURITY ================= */

    passwordChangedAt: {
      type: Date,

      default: null
    },

    resetPasswordToken: {
      type: String,

      default: null
    },

    resetPasswordExpires: {
      type: Date,

      default: null
    },

    /* ================= SYSTEM ================= */

    isDeleted: {
      type: Boolean,

      default: false
    }
  },

  {
    timestamps: true
  }
);

/* ================= INDEXES ================= */

userSchema.index({
  email: 1
});

userSchema.index({
  username: 1
});

userSchema.index({
  role: 1
});

userSchema.index({
  status: 1
});

/* ================= CLEAN DATA ================= */

userSchema.pre(
  "save",

  function () {

    if (this.email) {

      this.email =
        this.email
          .toLowerCase()
          .trim();
    }

    if (this.username) {

      this.username =
        this.username
          .toLowerCase()
          .trim();
    }
  }
);

/* ================= REMOVE SENSITIVE DATA ================= */

userSchema.methods.toJSON =
  function () {

    const obj =
      this.toObject();

    delete obj.password;

    delete obj.resetPasswordToken;

    delete obj.resetPasswordExpires;

    return obj;
  };

/* ================= EXPORT ================= */

const User =
  mongoose.model(
    "User",
    userSchema
  );

export default User;