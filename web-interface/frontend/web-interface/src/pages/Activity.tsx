import {
  Activity as ActivityIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Fan,
  Thermometer,
  Wifi,
} from "lucide-react";
import { useMemo } from "react";
import { mockDevices, mockSensorData } from "../mock-up-datas/data";
import type { Device, SensorData } from "../types/data";

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
  const device: Device = mockDevices[0];
  const latest: SensorData = mockSensorData[0];

  // Örnek fan/sensör durumları
  const fanIsOn = true;
  const fanLastChanged = new Date(Date.now() - 12 * 60 * 1000).toISOString();
  const sensorStartedAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Zaman çizelgesi (örnek olaylar)
  const events: DeviceEvent[] = useMemo(() => {
    return [
      {
        id: "evt-5",
        type: "sensor_reading",
        message: `Vücut sıcaklığı ölçümü: ${latest.bodyTemperature.toFixed(1)}°C`,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        severity: latest.bodyTemperature > 37 ? "high" : "low",
      },
      {
        id: "evt-4",
        type: "sensor_reading",
        message: `Nem ölçümü: %${latest.humidity.toFixed(1)}`,
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        severity: latest.humidity > 65 || latest.humidity < 45 ? "medium" : "low",
      },
      {
        id: "evt-3",
        type: "fan_on",
        message: "Fan cihazı aktif edildi",
        timestamp: fanLastChanged,
        severity: "low",
      },
      {
        id: "evt-2",
        type: "device_status",
        message: `Cihaz durumu: ${device.status === "working" ? "Çalışıyor" : device.status === "disabled" ? "Devre Dışı" : "Arıza"}`,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: device.status === "error" ? "high" : device.status === "disabled" ? "medium" : "low",
      },
      {
        id: "evt-1",
        type: "sensor_started",
        message: "Sensör başlatıldı",
        timestamp: sensorStartedAt,
        severity: "low",
      },
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [device.status, fanLastChanged, latest.bodyTemperature, latest.humidity, sensorStartedAt]);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Aktivite</h1>
        <p className="text-gray-600">Sensör ve fan cihazlarının durumları ile örnek zaman çizelgesi</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sensör Durumu */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Thermometer size={20} className="text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sensör Durumu</h3>
              <p className="text-sm text-gray-600">Bebek odası sensörü</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {device.status === "working" ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">
              {device.status === "working" ? "Çalışıyor" : device.status === "disabled" ? "Devre Dışı" : "Arıza"}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> Son görülme: {new Date(device.lastSeen).toLocaleTimeString("tr-TR")}
          </div>
        </div>

        {/* Fan Durumu */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Fan size={20} className="text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fan Durumu</h3>
              <p className="text-sm text-gray-600">Soğutma fanı</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {fanIsOn ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{fanIsOn ? "Aktif" : "Pasif"}</span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> Son değişim: {new Date(fanLastChanged).toLocaleTimeString("tr-TR")}
          </div>
        </div>

        {/* Bağlantı Durumu */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-cyan-100 p-3 rounded-lg">
              <Wifi size={20} className="text-cyan-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bağlantı</h3>
              <p className="text-sm text-gray-600">WiFi: {device.wifiSSID}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <ActivityIcon size={16} className="text-gray-600" />
            <span className="text-sm font-medium">Stabil</span>
          </div>
          <div className="text-xs text-gray-500">Konum: {device.location}</div>
        </div>
      </div>

      {/* Zaman Çizelgesi */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ActivityIcon size={18} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Zaman Çizelgesi</h2>
          </div>
          <span className="text-xs text-gray-500">Toplam olay: {events.length}</span>
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
                <span className={`text-xs px-2 py-1 rounded border ${getSeverityClasses(evt.severity)}`}>
                  {evt.severity === "high" ? "Acil" : evt.severity === "medium" ? "Orta" : "Düşük"}
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
          <div className="text-2xl font-bold text-gray-900">%{latest.humidity.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Zaman: {new Date(latest.timestamp).toLocaleTimeString("tr-TR")}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Ortam Sıcaklığı</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{latest.temperature.toFixed(1)}°C</div>
          <div className="text-xs text-gray-500">Zaman: {new Date(latest.timestamp).toLocaleTimeString("tr-TR")}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer size={20} className="text-red-600" />
            <h3 className="font-semibold text-gray-900">Vücut Sıcaklığı</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{latest.bodyTemperature.toFixed(1)}°C</div>
          <div className="text-xs text-gray-500">Zaman: {new Date(latest.timestamp).toLocaleTimeString("tr-TR")}</div>
        </div>
      </div>
    </div>
  );
}
