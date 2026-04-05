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
  // Check if we should use Brevo (Production) or Nodemailer (Development)
  // We also check for BREVO_API_KEY explicitly to avoid cryptic axios errors
  const useBrevo = isProduction && process.env.BREVO_API_KEY;

  if (useBrevo) {
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "Ghoroa Bazar",
            email: process.env.EMAIL_USER || "noreply@ghoroabazar.com",
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

      console.log(`✅ Email sent to ${to} via Brevo API`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("❌ Brevo API ERROR:", errorMsg);
      throw new Error(`Email failed: Brevo service error - ${errorMsg}`);
    }
  }
  // Fallback to Nodemailer if not in production OR if Brevo key is missing
  else {
    if (!transporter) {
       // Re-initialize transporter if it was skipped during start
       transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS,
         },
       });
    }
    try {
      await transporter.sendMail({
        from: `"Ghoroa Bazar" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent to ${to} via Nodemailer`);
    } catch (error) {
      console.error("❌ SMTP EMAIL ERROR:", error.message);
      throw new Error(`Email failed: SMTP service error - ${error.message}`);
    }
  }
};

module.exports = { sendEmail };