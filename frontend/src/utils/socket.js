import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Singleton Socket.IO instance — production-ready
 * 
 * - autoConnect: false → connect only when a page needs it
 * - transports: ["websocket"] → skip long-polling overhead
 * - reconnectionAttempts: 10 → don't retry forever in production
 * - No global listeners here — components manage their own lifecycle
 */
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  timeout: 20000,
  transports: ["websocket"],
});

export default socket;
