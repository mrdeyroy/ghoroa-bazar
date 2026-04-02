// Environment Detection
const IS_PROD_MODE = import.meta.env.MODE === "production";
const isLocalHostname = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
// Only use localhost if we are BOTH on a local hostname AND in a development ENV.
const USE_LOCAL = isLocalHostname && !IS_PROD_MODE;
const PROD_BACKEND = "https://ghoroa-bazar-backend.onrender.com";

const getUrl = (envVar, fallback) => {
  const value = import.meta.env[envVar];
  if (value && typeof value === 'string') {
    const trimmed = value.split(",")[0].trim();
    
    // Safety check: Don't use localhost in a production build even if it's in the .env
    const isValLocal = trimmed.includes("localhost") || trimmed.includes("127.0.0.1");
    if (IS_PROD_MODE && isValLocal) {
      return fallback;
    }
    
    return trimmed;
  }
  return fallback;
};

export const BASE_URL = getUrl("VITE_API_URL", USE_LOCAL ? "http://localhost:5000" : PROD_BACKEND);
export const SOCKET_URL = getUrl("VITE_SOCKET_URL", BASE_URL);
