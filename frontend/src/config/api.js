const getUrl = (envVar, fallback) => {
  const value = import.meta.env[envVar];
  if (value && typeof value === 'string') {
    return value.split(",")[0].trim();
  }
  return fallback;
};

// If we are in production (not on localhost/127.0.0.1), default to the actual production backend
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const PROD_BACKEND = "https://ghoroa-bazar-backend.onrender.com";

export const BASE_URL = getUrl("VITE_API_URL", isLocal ? "http://localhost:5000" : PROD_BACKEND);
export const SOCKET_URL = getUrl("VITE_SOCKET_URL", BASE_URL);
