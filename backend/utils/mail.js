const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // 👈 VERY IMPORTANT (force IPv4)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log("SMTP ERROR:", err);
  } else {
    console.log("SMTP READY");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: '"Ghoroa Bazar" <' + process.env.EMAIL_USER + '>',
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("FULL EMAIL ERROR:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
