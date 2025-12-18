import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, Zap } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  duration?: number;
}

interface GameNotificationsProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function GameNotifications({
  notifications,
  onRemove,
}: GameNotificationsProps) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-lg shadow-lg flex items-center gap-3 ${getBackgroundColor(
              notification.type
            )}`}
          >
            {getIcon(notification.type)}
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case "warning":
      return <Zap className="w-5 h-5 text-yellow-600" />;
    case "info":
    default:
      return <Info className="w-5 h-5 text-blue-600" />;
  }
}

function getBackgroundColor(type: string) {
  switch (type) {
    case "success":
      return "bg-green-50 border border-green-200";
    case "error":
      return "bg-red-50 border border-red-200";
    case "warning":
      return "bg-yellow-50 border border-yellow-200";
    case "info":
    default:
      return "bg-blue-50 border border-blue-200";
  }
}
