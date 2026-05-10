import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

/* ================= TRANSPORT ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= VERIFY ================= */
(async () => {
  try {
    console.log("🔍 Mailer ENV:", {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? "EXISTS" : "MISSING"
    });

    await transporter.verify();
    console.log("✅ Email server ready");

  } catch (err) {
    console.error("❌ EMAIL CONFIG ERROR:", err.message);
  }
})();

/* ================= SEND ================= */
export const sendCredentialsMail = async ({ to, username, password }) => {
  try {
    const info = await transporter.sendMail({
      from: `"POS System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Staff Account",
      html: `
        <h3>Account Created</h3>
        Username: ${username}<br/>
        Password: ${password}<br/><br/>
        ⚠ Change password after login
      `
    });

    console.log("✅ Email sent:", info.response);

  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err.message);
  }
};