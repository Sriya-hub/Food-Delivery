import bcrypt from "bcryptjs";
import User from "../model/user.model.js";

const registerService = async (data) => {
  const { name, email, phone, password, confirmPassword, role } = data;

  // 🔴 VALIDATION
  if (!name || !email || !phone || !password || !confirmPassword || !role) {
    throw new Error("All fields are required");
  }

  if (!email.endsWith("@gmail.com")) {
    throw new Error("Only gmail allowed");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // 🔴 CHECK EXISTING USER
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // 🔐 HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // 💾 SAVE USER
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role
  });

  return {
    id: user._id,
    email: user.email,
    role: user.role
  };
};

export default registerService;