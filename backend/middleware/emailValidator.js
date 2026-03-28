const axios = require("axios");
const disposableDomains = require("../utils/disposableDomains");
const trustedDomains = require("../utils/trustedDomains");
const emailCache = require("../utils/emailCache");

/**
 * Layered Email Validation Middleware
 * 1. Format (regex)
 * 2. Local Disposable Domain Check
 * 3. Cache Check
 * 4. External API Check (Abstract API)
 */
const emailValidator = async (req, res, next) => {
  // Normalize email to reduce duplicate/malformed account issues
  if (!req.body.email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  const email = req.body.email.toLowerCase().trim();
  req.body.email = email; // Update original body for next middleware

  // 1. Regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const domain = email.split("@")[1].toLowerCase();

  // 2. Trusted domain check (with environment toggle)
  const allowOnlyTrusted = process.env.ALLOW_ONLY_TRUSTED_DOMAINS === "true";
  if (allowOnlyTrusted && !trustedDomains.includes(domain)) {
    return res.status(400).json({ 
      error: "Please use a valid email provider (Gmail, Outlook, Yahoo, etc.)" 
    });
  }

  // 3. Local disposable domain check
  if (disposableDomains.includes(domain)) {
    return res.status(400).json({ error: "Disposable email addresses are not allowed" });
  }

  // 3. Cache check
  const cachedStatus = emailCache.get(email);
  if (cachedStatus === "blocked") {
    return res.status(400).json({ error: "This email address is temporary or invalid (cached)" });
  } else if (cachedStatus === "valid") {
    return next();
  }

  // 4. External API Check (Abstract API)
  const apiKey = process.env.ABSTRACT_EMAIL_VALIDATION_API_KEY;
  if (!apiKey) {
    console.warn("ABSTRACT_EMAIL_VALIDATION_API_KEY not found, skipping external validation");
    return next();
  }

  try {
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/`, {
      params: {
        api_key: apiKey,
        email: email
      }
    });

    const result = response.data;

    // Check if the API marks it as disposable or invalid
    if (result.is_disposable_email?.value || result.deliverability === "UNDELIVERABLE") {
      emailCache.set(email, "blocked");
      return res.status(400).json({ error: "Temporary or invalid email addresses are not allowed" });
    }

    // Cache valid emails as well to avoid redundant API calls
    emailCache.set(email, "valid");
    next();
  } catch (error) {
    console.log("Email API failed:", error.message);
    next(); // Fallback: allow instead of blocking on API failure
  }
};

module.exports = emailValidator;
