const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

// =======================
// ✅ Nodemailer (LOCAL ONLY)
// =======================

let transporter;

if (!isProduction) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ✅ same name
    },
  });

  // Debug (only local)
  transporter.verify((err) => {
    if (err) {
      console.log("❌ LOCAL SMTP ERROR:", err.message);
    } else {
      console.log("✅ LOCAL SMTP READY");
    }
  });
}

// =======================
// ✅ Main Send Function
// =======================

const sendEmail = async (to, subject, html) => {
  // 🚀 PRODUCTION → Brevo API
  if (isProduction) {
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "Ghoroa Bazar",
            email: process.env.EMAIL_USER,
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Email sent via Brevo API");
    } catch (error) {
      console.error(
        "❌ Brevo API ERROR:",
        error.response?.data || error.message
      );
      throw new Error("Email failed");
    }
  }

  // 🧪 LOCAL → Nodemailer
  else {
    try {
      await transporter.sendMail({
        from: `"Ghoroa Bazar" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log("✅ Email sent via Nodemailer (local)");
    } catch (error) {
      console.error("❌ LOCAL EMAIL ERROR:", error);
      throw new Error("Email failed");
    }
  }
};

module.exports = { sendEmail };