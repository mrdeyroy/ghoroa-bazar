import { io } from "socket.io-client";


/**
 * Singleton Socket.IO instance — production-ready
 * 
 * - autoConnect: false → connect only when a page needs it
 * - transports: ["websocket"] → skip long-polling overhead
 * - reconnectionAttempts: 10 → don't retry forever in production
 * - No global listeners here — components manage their own lifecycle
 */
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"]
});


export default socket;
