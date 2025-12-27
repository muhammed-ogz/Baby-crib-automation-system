import type {
  Alert,
  DashboardStats,
  Device,
  SensorData,
  ThresholdSettings,
} from "../types/data";
import { ALERT_TYPES, DEVICE_STATUS } from "../types/data";

// Gerçekçi sensör verileri - Bebek sıcaklığının düşüp yükseldiği örnek veriler
export const mockSensorData: SensorData[] = [
  {
    id: "1",
    deviceId: "device-001",
    timestamp: new Date().toISOString(),
    temperature: 23.5,
    humidity: 55.2,
    bodyTemperature: 36.8, // Normal
  },
  {
    id: "2",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    temperature: 23.2,
    humidity: 54.8,
    bodyTemperature: 37.1, // Hafif yüksek
  },
  {
    id: "3",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    temperature: 23.8,
    humidity: 56.1,
    bodyTemperature: 37.4, // Yüksek
  },
  {
    id: "4",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    temperature: 23.6,
    humidity: 55.5,
    bodyTemperature: 37.3, // Hala yüksek
  },
  {
    id: "5",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    temperature: 23.4,
    humidity: 55.0,
    bodyTemperature: 37.0, // Düşüşe başladı
  },
  {
    id: "6",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    temperature: 23.3,
    humidity: 54.9,
    bodyTemperature: 36.7, // Daha düşüldü
  },
  {
    id: "7",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    temperature: 23.1,
    humidity: 54.5,
    bodyTemperature: 36.4, // Çok düşük
  },
  {
    id: "8",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    temperature: 23.2,
    humidity: 54.8,
    bodyTemperature: 36.5, // Yükselmeye başladı
  },
  {
    id: "9",
    deviceId: "device-001",
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    temperature: 23.4,
    humidity: 55.2,
    bodyTemperature: 36.9, // Normal'e yaklaştı
  },
];

// Cihaz bilgileri
export const mockDevices: Device[] = [
  {
    id: "device-001",
    name: "Bebek Odası Sensörü",
    wifiSSID: "EV_WIFI_5G",
    status: DEVICE_STATUS.WORKING,
    lastSeen: new Date().toISOString(),
    location: "Ana Yatak Odası",
  },
];

// Örnek uyarılar
export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    type: ALERT_TYPES.BODY_TEMP_HIGH,
    message: "Bebek vücut sıcaklığı normal seviyenin üzerinde (37.2°C)",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "high",
    isRead: false,
  },
  {
    id: "alert-002",
    type: ALERT_TYPES.HUMIDITY_LOW,
    message: "Ortam nemi düşük seviyede (%42)",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "medium",
    isRead: true,
  },
];

// Varsayılan eşik değerleri (bebek için uygun aralıklar)
export const defaultThresholds: ThresholdSettings = {
  temperature: {
    min: 20.0, // Minimum oda sıcaklığı
    max: 26.0, // Maksimum oda sıcaklığı
  },
  humidity: {
    min: 45.0, // Minimum nem oranı
    max: 65.0, // Maksimum nem oranı
  },
  bodyTemperature: {
    min: 36.0, // Minimum vücut sıcaklığı
    max: 37.0, // Maksimum vücut sıcaklığı (ateş sınırı)
  },
};

// Dashboard istatistikleri
export const mockDashboardStats: DashboardStats = {
  totalDevices: 1,
  activeDevices: 1,
  totalAlerts: 2,
  unreadAlerts: 1,
};

// Gerçek zamanlı veri simülasyonu için yardımcı fonksiyon
export const generateRandomSensorData = (
  deviceId: string = "device-001"
): SensorData => ({
  id: `sensor-${Date.now()}`,
  deviceId,
  timestamp: new Date().toISOString(),
  temperature: Math.round((22 + Math.random() * 4) * 10) / 10, // 22-26°C
  humidity: Math.round((50 + Math.random() * 20) * 10) / 10, // 50-70%
  bodyTemperature: Math.round((36.5 + Math.random() * 1) * 10) / 10, // 36.5-37.5°C
});
