import mongoose from "mongoose";

/* ================= ROLE CONSTANTS ================= */

export const STAFF_ROLES = [
  "Admin",
  "Manager",
  "Cashier",
  "Vendor"
];

/* ================= STAFF SCHEMA ================= */

const staffSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Invalid email format"
      ]
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

    /* ================= STORE ================= */

    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },

    /* ================= ROLE ================= */

    role: {
      type: String,
      enum: STAFF_ROLES,
      default: "Cashier"
    },

    /* ================= STATUS ================= */

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },

    shift: {
      type: String,
      enum: [
        "Morning",
        "Afternoon",
        "Evening"
      ],
      default: "Morning"
    },

    /* ================= PROFILE ================= */

    profileImage: {
      type: String,
      default: null
    },

    phone: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    /* ================= PERFORMANCE ================= */

    orders: {
      type: Number,
      default: 0,
      min: 0
    },

    sales: {
      type: Number,
      default: 0,
      min: 0
    },

    avgOrder: {
      type: Number,
      default: 0,
      min: 0
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

staffSchema.index({
  email: 1
});

staffSchema.index({
  username: 1
});

staffSchema.index({
  store_id: 1
});

staffSchema.index({
  role: 1
});

staffSchema.index({
  status: 1
});

/* ================= CLEAN DATA ================= */

staffSchema.pre(
  "save",

  function () {

    // CLEAN EMAIL
    if (this.email) {

      this.email =
        this.email
          .toLowerCase()
          .trim();
    }

    // CLEAN USERNAME
    if (this.username) {

      this.username =
        this.username
          .toLowerCase()
          .trim();
    }
  }
);

/* ================= CALCULATE AVG ORDER ================= */

staffSchema.pre(
  "save",

  function () {

    if (this.orders > 0) {

      this.avgOrder =
        Math.round(
          this.sales /
          this.orders
        );

    } else {

      this.avgOrder = 0;
    }
  }
);

/* ================= REMOVE SENSITIVE DATA ================= */

staffSchema.methods.toJSON =
  function () {

    const obj =
      this.toObject();

    delete obj.password;

    delete obj.resetPasswordToken;

    delete obj.resetPasswordExpires;

    return obj;
  };

/* ================= EXPORT ================= */

const Staff =
  mongoose.model(
    "Staff",
    staffSchema
  );

export default Staff;