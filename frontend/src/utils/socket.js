import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api";


/**
 * Singleton Socket.IO instance — production-ready
 * 
 * - autoConnect: false → connect only when a page needs it
 * - transports: ["websocket"] → skip long-polling overhead
 * - reconnectionAttempts: 10 → don't retry forever in production
 * - No global listeners here — components manage their own lifecycle
 */
const socket = io(SOCKET_URL, {
  transports: ["websocket"]
});


export default socket;
