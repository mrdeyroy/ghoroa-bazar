const xss = require("xss");

/**
 * Recursively sanitizes objects/arrays for NoSQL Injection ($ keys) and XSS.
 * Safe for Express 5 as it only mutates property values.
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== "object") return;

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (typeof item === "string") {
        data[index] = xss(item);
      } else if (typeof item === "object") {
        sanitizeData(item);
      }
    });
  } else {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // NoSQL Sanitization: remove keys starting with $
        if (key.startsWith("$")) {
          delete data[key];
          continue;
        }

        if (typeof data[key] === "string") {
          data[key] = xss(data[key]);
        } else if (typeof data[key] === "object") {
          sanitizeData(data[key]);
        }
      }
    }
  }
};

const securitySanitizer = (req, res, next) => {
  // 1️⃣ Fix Parameter Pollution (HPP) - Express 5 compatible
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        // Only keep the last value
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }

  // 2️⃣ Sanitize everything (XSS & NoSQL)
  if (req.query) sanitizeData(req.query);
  if (req.body) sanitizeData(req.body);
  if (req.params) sanitizeData(req.params);

  next();
};

module.exports = securitySanitizer;
