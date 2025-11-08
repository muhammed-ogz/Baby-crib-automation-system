import { useEffect } from "react";
import toast from "react-hot-toast";
import type { Alert } from "../types/data";

// Toast bildirimleri için yardımcı hook
export const useAlertToast = (alerts: Alert[]) => {
  useEffect(() => {
    // Yeni uyarılar için toast bildirimi göster
    const unreadAlerts = alerts.filter((alert) => !alert.isRead);

    unreadAlerts.forEach((alert) => {
      const toastId = `alert-${alert.id}`;
      const icon = getAlertIcon(alert.type);
      const duration = alert.severity === "high" ? 8000 : 4000;

      // Önem derecesine göre farklı toast türleri
      if (alert.severity === "high") {
        toast.error(`${icon} ${alert.message}`, {
          id: toastId,
          duration,
          style: {
            background: getSeverityBgColor(alert.severity),
            color: "#991b1b", // text-red-800
            border: "1px solid #fecaca", // border-red-200
          },
        });
      } else if (alert.severity === "medium") {
        toast(`${icon} ${alert.message}`, {
          id: toastId,
          duration,
          style: {
            background: getSeverityBgColor(alert.severity),
            color: "#9a3412", // text-orange-800
            border: "1px solid #fed7aa", // border-orange-200
          },
        });
      } else {
        toast.success(`${icon} ${alert.message}`, {
          id: toastId,
          duration,
          style: {
            background: getSeverityBgColor(alert.severity),
            color: "#365314", // text-lime-800
            border: "1px solid #d9f99d", // border-lime-200
          },
        });
      }
    });
  }, [alerts]);
};

// Test toast'ı göstermek için yardımcı fonksiyon
export const showTestToast = () => {
  toast.success("🎉 Toast sistemi çalışıyor!", {
    duration: 3000,
    style: {
      background: "#f0fdf4",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
  });
};

// Uyarı tipine göre ikon döndüren yardımcı fonksiyon
const getAlertIcon = (type: string) => {
  if (type.includes("temperature")) {
    return "🌡️";
  }
  if (type.includes("humidity")) {
    return "💧";
  }
  if (type.includes("body")) {
    return "❤️";
  }
  if (type.includes("device")) {
    return "📡";
  }
  return "⚠️";
};

// Önem derecesine göre arka plan rengi (CSS style için)
const getSeverityBgColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "#fef2f2"; // bg-red-50
    case "medium":
      return "#fff7ed"; // bg-orange-50
    case "low":
      return "#fefce8"; // bg-yellow-50
    default:
      return "#eff6ff"; // bg-blue-50
  }
};
