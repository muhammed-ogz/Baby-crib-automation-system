// Sensör verileri için type tanımlamaları
export interface SensorData {
  id: string;
  deviceId: string;
  timestamp: string;
  temperature: number; // Ortam sıcaklığı (°C)
  humidity: number; // Ortam nemi (%)
  bodyTemperature: number; // Bebek vücut sıcaklığı (°C)
}

// Cihaz durumu union type
export type DeviceStatus = "working" | "disabled" | "error";

// Cihaz durumu sabitler
export const DEVICE_STATUS = {
  WORKING: "working" as const, // Çalışıyor - yeşil
  DISABLED: "disabled" as const, // Devre dışı - sarı
  ERROR: "error" as const, // Sistemsel arıza - kırmızı
};

// Cihaz bilgileri
export interface Device {
  id: string;
  name: string;
  wifiSSID: string;
  status: DeviceStatus;
  lastSeen: string;
  location?: string;
}

// Eşik değerleri
export interface ThresholdSettings {
  temperature: {
    min: number;
    max: number;
  };
  humidity: {
    min: number;
    max: number;
  };
  bodyTemperature: {
    min: number;
    max: number;
  };
}

// Uyarı türleri union type
export type AlertType =
  | "temperature_high"
  | "temperature_low"
  | "humidity_high"
  | "humidity_low"
  | "body_temp_high"
  | "body_temp_low"
  | "device_offline";

// Uyarı türü sabitler
export const ALERT_TYPES = {
  TEMPERATURE_HIGH: "temperature_high" as const,
  TEMPERATURE_LOW: "temperature_low" as const,
  HUMIDITY_HIGH: "humidity_high" as const,
  HUMIDITY_LOW: "humidity_low" as const,
  BODY_TEMP_HIGH: "body_temp_high" as const,
  BODY_TEMP_LOW: "body_temp_low" as const,
  DEVICE_OFFLINE: "device_offline" as const,
};

// Uyarı interface'i
export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  deviceId: string;
  severity: "low" | "medium" | "high";
  isRead: boolean;
}

// Kullanıcı bilgileri
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Dashboard istatistikleri
export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  totalAlerts: number;
  unreadAlerts: number;
}
