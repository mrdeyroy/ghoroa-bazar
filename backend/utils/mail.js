const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Brevo transporter (PRIMARY)
const brevoTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
  connectionTimeout: 10000,
});

// ✅ Gmail transporter (BACKUP)
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
  family: 4, // 🔥 force IPv4 (Render issue fix)
  connectionTimeout: 10000,
});

// ✅ Verify both SMTP connections (startup debug)
brevoTransporter.verify((err) => {
  if (err) {
    console.log("❌ Brevo SMTP ERROR:", err.message);
  } else {
    console.log("✅ Brevo SMTP READY");
  }
});

gmailTransporter.verify((err) => {
  if (err) {
    console.log("❌ Gmail SMTP ERROR:", err.message);
  } else {
    console.log("✅ Gmail SMTP READY");
  }
});

// ✅ Main send function with fallback
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Ghoroa Bazar" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    // 🔥 Try Brevo first
    await brevoTransporter.sendMail(mailOptions);
    console.log("✅ Email sent via Brevo");
  } catch (brevoError) {
    console.log("⚠️ Brevo failed:", brevoError.message);

    try {
      // 🔁 Fallback Gmail
      await gmailTransporter.sendMail(mailOptions);
      console.log("✅ Email sent via Gmail");
    } catch (gmailError) {
      console.error("❌ Both email services failed:", gmailError);
      throw new Error("All email services failed");
    }
  }
};

module.exports = { sendEmail };