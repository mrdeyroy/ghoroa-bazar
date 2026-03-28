import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

/**
 * BroadcastPopup — full-screen modal that appears when admin sends a broadcast.
 * Renders on top of everything. Dismisses on click or button.
 */
export default function BroadcastPopup() {
  const { broadcastPopup, dismissBroadcast } = useNotifications();

  return (
    <AnimatePresence>
      {broadcastPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissBroadcast}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          >
            <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#064734] to-[#1F7A3B] px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg tracking-tight">📢 Announcement</h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">From Ghoroa Bazar</p>
                  </div>
                </div>
                <button
                  onClick={dismissBroadcast}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-700 text-base leading-relaxed font-medium">
                  {broadcastPopup.message}
                </p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-4">
                  {new Date(broadcastPopup.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={dismissBroadcast}
                  className="w-full py-3.5 bg-[#1F7A3B] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#185e2e] transition-all active:scale-95 shadow-lg shadow-green-100"
                >
                  Got It
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
