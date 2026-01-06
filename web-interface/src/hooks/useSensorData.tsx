import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

interface SensorData {
  id: string;
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  bodyTemperature: number;
  alerts?: Array<{
    type: string;
    value: number;
    threshold: { min?: number; max?: number };
  }>;
}

interface UseSensorDataReturn {
  sensorData: SensorData | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  requestLatestData: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function useSensorData(): UseSensorDataReturn {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstConnectionRef = useRef(true);

  const requestLatestData = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("requestLatestData");
    }
  }, []);

  useEffect(() => {
    // Create socket connection
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      setError(null);
      setIsLoading(false);

      if (!isFirstConnectionRef.current) {
        toast.success("Bağlantı yeniden kuruldu", {
          icon: "🔌",
          duration: 3000,
        });
      }
      isFirstConnectionRef.current = false;

      // Request latest data on connect
      socket.emit("requestLatestData");
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️  WebSocket disconnected:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        socket.connect();
      }

      toast.error("Bağlantı kesildi", {
        icon: "🔌",
        duration: 3000,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket connection error:", err);
      setError("Sunucuya bağlanılamadı");
      setIsLoading(false);
      setIsConnected(false);
    });

    // Sensor data event handler
    socket.on("sensorData", (data: SensorData) => {
      console.log("📊 Sensor data received:", data);
      setSensorData(data);
      setError(null);

      // Show alerts if any
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert) => {
          const alertMessages: Record<string, string> = {
            temperature_high: `Yüksek sıcaklık: ${data.temperature.toFixed(
              1
            )}°C`,
            temperature_low: `Düşük sıcaklık: ${data.temperature.toFixed(1)}°C`,
            humidity_high: `Yüksek nem: ${data.humidity.toFixed(1)}%`,
            humidity_low: `Düşük nem: ${data.humidity.toFixed(1)}%`,
            body_temp_high: `Yüksek vücut sıcaklığı: ${data.bodyTemperature.toFixed(
              1
            )}°C`,
            body_temp_low: `Düşük vücut sıcaklığı: ${data.bodyTemperature.toFixed(
              1
            )}°C`,
          };

          const message = alertMessages[alert.type] || `Uyarı: ${alert.type}`;

          toast.error(message, {
            icon: "⚠️",
            duration: 5000,
            position: "top-right",
          });
        });
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      toast.success("Bağlantı yeniden kuruldu", {
        icon: "🔌",
        duration: 3000,
      });
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    socket.on("reconnect_error", (err) => {
      console.error("❌ Reconnection error:", err);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
      setError("Sunucuya bağlanılamadı");
      toast.error("Bağlantı kurulamadı", {
        icon: "❌",
        duration: 5000,
      });
    });

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("sensorData");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.off("reconnect_error");
      socket.off("reconnect_failed");
      socket.close();
    };
  }, []);

  return {
    sensorData,
    isConnected,
    isLoading,
    error,
    requestLatestData,
  };
}
