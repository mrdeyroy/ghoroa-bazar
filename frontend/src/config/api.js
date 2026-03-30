export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || BASE_URL;
