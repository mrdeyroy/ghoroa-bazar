const getUrl = (envVar, fallback) => {
  const value = import.meta.env[envVar];
  if (!value) return fallback;
  // If multiple URLs are provided (comma-separated), take the first one
  return value.split(",")[0].trim();
};

export const BASE_URL = getUrl("VITE_API_URL", "http://localhost:5000");
export const SOCKET_URL = getUrl("VITE_SOCKET_URL", BASE_URL);
