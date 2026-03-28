const axios = require("axios");

/**
 * Cloudflare Turnstile token verification middleware
 */
const captchaVerify = async (req, res, next) => {
  const token = req.body["cf-turnstile-response"]; // Change to appropriate key if different

  if (!token) {
    return res.status(400).json({ error: "CAPTCHA verification is required" });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not defined in environment variables");
    throw new Error("Missing TURNSTILE_SECRET_KEY - Check your backend .env file");
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: req.ip
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { success, "error-codes": errorCodes } = response.data;

    if (!success) {
      console.warn("Turnstile verification failed:", errorCodes);
      return res.status(403).json({ error: "CAPTCHA verification failed. Please try again." });
    }

    next();
  } catch (error) {
    console.error("CAPTCHA verification error:", error.message);
    return res.status(500).json({ error: "Internal server error during CAPTCHA verification" });
  }
};

module.exports = captchaVerify;
