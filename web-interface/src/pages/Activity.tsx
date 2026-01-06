import {
  Activity as ActivityIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Thermometer,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSensorData } from "../hooks/useSensorData";
import { defaultThresholds } from "../mock-up-datas/data";
import type { SensorData } from "../types/data";

type EventSeverity = "low" | "medium" | "high";
type DeviceEvent = {
  id: string;
  type:
    | "sensor_started"
    | "sensor_reading"
    | "fan_on"
    | "fan_off"
    | "device_status";
  message: string;
  timestamp: string;
  severity: EventSeverity;
};

const getSeverityClasses = (s: EventSeverity) => {
  switch (s) {
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-200";
    default:
      return "text-green-700 bg-green-50 border-green-200";
  }
};

export default function Activity() {
  const { sensorData, isConnected, isLoading } = useSensorData();
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);

  // Sensör verilerini kaydet (son 50 ölçüm)
  useEffect(() => {
    if (sensorData) {
      setCurrentData(sensorData);
      setSensorHistory((prev) => {
        const newHistory = [sensorData, ...prev];
        return newHistory.slice(0, 50); // Son 50 kayıt
      });
    }
  }, [sensorData]);

  // Zaman çizelgesi (gerçek sensör kayıtları)
  const events: DeviceEvent[] = useMemo(() => {
    if (!currentData) return [];

    const newEvents: DeviceEvent[] = [];

    // Son ölçüm
    newEvents.push({
      id: `evt-latest-${currentData.timestamp}`,
      type: "sensor_reading",
      message: `Yeni ölçüm alındı: Sıcaklık ${currentData.temperature.toFixed(
        1
      )}°C, Nem %${currentData.humidity.toFixed(
        1
      )}, Vücut ${currentData.bodyTemperature.toFixed(1)}°C`,
      timestamp: currentData.timestamp,
      severity: "low",
    });

    // Vücut sıcaklığı kontrolleri
    if (currentData.bodyTemperature > defaultThresholds.bodyTemperature.max) {
      newEvents.push({
        id: `evt-body-high-${currentData.timestamp}`,
        type: "sensor_reading",
        message: `⚠️ Yüksek vücut sıcaklığı tespit edildi: ${currentData.bodyTemperature.toFixed(
          1
        )}°C (Normal: ${defaultThresholds.bodyTemperature.min}-${
          defaultThresholds.bodyTemperature.max
        }°C)`,
        timestamp: currentData.timestamp,
        severity: "high",
      });
    } else if (
      currentData.bodyTemperature < defaultThresholds.bodyTemperature.min
    ) {
      newEvents.push({
        id: `evt-body-low-${currentData.timestamp}`,
        type: "sensor_reading",
        message: `⚠️ Düşük vücut sıcaklığı tespit edildi: ${currentData.bodyTemperature.toFixed(
          1
        )}°C (Normal: ${defaultThresholds.bodyTemperature.min}-${
          defaultThresholds.bodyTemperature.max
        }°C)`,
        timestamp: currentData.timestamp,
        severity: "high",
      });
    }

    // Nem kontrolleri
    if (currentData.humidity > defaultThresholds.humidity.max) {
      newEvents.push({
        id: `evt-humidity-high-${currentData.timestamp}`,
        type: "sensor_reading",
        message: `⚠️ Yüksek nem seviyesi: %${currentData.humidity.toFixed(
          1
        )} (Normal: %${defaultThresholds.humidity.min}-%${
          defaultThresholds.humidity.max
        })`,
        timestamp: currentData.timestamp,
        severity: "medium",
      });
    } else if (currentData.humidity < defaultThresholds.humidity.min) {
      newEvents.push({
        id: `evt-humidity-low-${currentData.timestamp}`,
        type: "sensor_reading",
        message: `⚠️ Düşük nem seviyesi: %${currentData.humidity.toFixed(
          1
        )} (Normal: %${defaultThresholds.humidity.min}-%${
          defaultThresholds.humidity.max
        })`,
        timestamp: currentData.timestamp,
        severity: "medium",
      });
    }

    // Sıcaklık kontrolleri
    if (currentData.temperature > defaultThresholds.temperature.max) {
      newEvents.push({
        id: `evt-temp-high-${currentData.timestamp}`,
        type: "sensor_reading",
        message: `⚠️ Yüksek oda sıcaklığı: ${currentData.temperature.toFixed(
          1
        )}°C (Normal: ${defaultThresholds.temperature.min}-${
          defaultThresholds.temperature.max
        }°C)`,
        timestamp: currentData.timestamp,
        severity: "medium",
      });
    } else if (currentData.temperature < defaultThresholds.temperature.min) {
      newEvents.push({
        id: `evt-temp-low-${currentData.timestamp}`,
        type: "sensor_reading",
        message: `⚠️ Düşük oda sıcaklığı: ${currentData.temperature.toFixed(
          1
        )}°C (Normal: ${defaultThresholds.temperature.min}-${
          defaultThresholds.temperature.max
        }°C)`,
        timestamp: currentData.timestamp,
        severity: "medium",
      });
    }

    // Geçmiş kayıtlardan event'ler oluştur
    sensorHistory.slice(1, 10).forEach((data, index) => {
      newEvents.push({
        id: `evt-history-${data.timestamp}-${index}`,
        type: "sensor_reading",
        message: `Ölçüm kaydı: Sıcaklık ${data.temperature.toFixed(
          1
        )}°C, Nem %${data.humidity.toFixed(
          1
        )}, Vücut ${data.bodyTemperature.toFixed(1)}°C`,
        timestamp: data.timestamp,
        severity: "low",
      });
    });

    return newEvents.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [currentData, sensorHistory]);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Aktivite
        </h1>
        <p className="text-gray-600">
          Sensör ve fan cihazlarının durumları ile örnek zaman çizelgesi
        </p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sensör Durumu */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`${
                isConnected ? "bg-green-100" : "bg-red-100"
              } p-3 rounded-lg`}
            >
              <Thermometer
                size={20}
                className={isConnected ? "text-green-700" : "text-red-700"}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sensör Durumu</h3>
              <p className="text-sm text-gray-600">ESP32 Sensör</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {isConnected ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">
              {isLoading
                ? "Bağlanıyor..."
                : isConnected
                ? "Çalışıyor"
                : "Bağlantı Yok"}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} />{" "}
            {currentData
              ? `Son ölçüm: ${new Date(
                  currentData.timestamp
                ).toLocaleTimeString("tr-TR")}`
              : "Veri bekleniyor..."}
          </div>
        </div>

        {/* Toplam Ölçüm */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp size={20} className="text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Toplam Ölçüm</h3>
              <p className="text-sm text-gray-600">Kayıt sayısı</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <ActivityIcon size={16} className="text-blue-600" />
            <span className="text-sm font-medium">
              {sensorHistory.length} kayıt
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> Bellek: Son 50 kayıt tutulur
          </div>
        </div>

        {/* Bağlantı Durumu */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`${
                isConnected ? "bg-cyan-100" : "bg-gray-100"
              } p-3 rounded-lg`}
            >
              {isConnected ? (
                <Wifi size={20} className="text-cyan-700" />
              ) : (
                <WifiOff size={20} className="text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bağlantı</h3>
              <p className="text-sm text-gray-600">WebSocket</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {isConnected ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">
              {isConnected ? "Bağlı" : "Bağlı Değil"}
            </span>
          </div>
          <div className="text-xs text-gray-500">Gerçek zamanlı veri akışı</div>
        </div>
      </div>

      {/* Zaman Çizelgesi */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ActivityIcon size={18} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Zaman Çizelgesi
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            Toplam olay: {events.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{evt.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(evt.timestamp).toLocaleString("tr-TR")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded border ${getSeverityClasses(
                    evt.severity
                  )}`}
                >
                  {evt.severity === "high"
                    ? "Acil"
                    : evt.severity === "medium"
                    ? "Orta"
                    : "Düşük"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Son Ölçümler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Droplets size={20} className="text-cyan-600" />
            <h3 className="font-semibold text-gray-900">Nem</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {currentData ? `%${currentData.humidity.toFixed(1)}` : "--"}
          </div>
          <div className="text-xs text-gray-500">
            {currentData
              ? `Zaman: ${new Date(currentData.timestamp).toLocaleTimeString(
                  "tr-TR"
                )}`
              : "Veri bekleniyor..."}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Ortam Sıcaklığı</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {currentData ? `${currentData.temperature.toFixed(1)}°C` : "--"}
          </div>
          <div className="text-xs text-gray-500">
            {currentData
              ? `Zaman: ${new Date(currentData.timestamp).toLocaleTimeString(
                  "tr-TR"
                )}`
              : "Veri bekleniyor..."}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer size={20} className="text-red-600" />
            <h3 className="font-semibold text-gray-900">Vücut Sıcaklığı</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {currentData ? `${currentData.bodyTemperature.toFixed(1)}°C` : "--"}
          </div>
          <div className="text-xs text-gray-500">
            {currentData
              ? `Zaman: ${new Date(currentData.timestamp).toLocaleTimeString(
                  "tr-TR"
                )}`
              : "Veri bekleniyor..."}
          </div>
        </div>
      </div>
    </div>
  );
}
