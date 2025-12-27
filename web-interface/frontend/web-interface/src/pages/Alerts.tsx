import { AlertTriangle, Baby, Clock, Droplets } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { mockAlerts, mockSensorData, defaultThresholds } from "../mock-up-datas/data";
import type { Alert } from "../types/data";

// Sayfa içi ek örnek uyarılar: bebek sıcaklığı yükselir/düşer akışı
const tempFlowExamples: Alert[] = [
  {
    id: `alert-temp-up-1`,
    type: "body_temp_high",
    message: "Bebek vücut sıcaklığı yükseldi (37.3°C)",
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "high",
    isRead: false,
  },
  {
    id: `alert-temp-up-2`,
    type: "body_temp_high",
    message: "Bebek vücut sıcaklığı yüksek (37.4°C)",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "high",
    isRead: false,
  },
  {
    id: `alert-temp-down-1`,
    type: "body_temp_low",
    message: "Bebek vücut sıcaklığı düşüyor (36.7°C)",
    timestamp: new Date(Date.now() - 90 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "medium",
    isRead: false,
  },
  {
    id: `alert-temp-down-2`,
    type: "body_temp_low",
    message: "Bebek vücut sıcaklığı normale yaklaştı (36.5°C)",
    timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "low",
    isRead: false,
  },
];

// Nem (humidity) ile ilgili örnek uyarılar akışı
const humidityExamples: Alert[] = [
  {
    id: `alert-humidity-high-1`,
    type: "humidity_high",
    message: "Ortam nemi yükseldi (%68)",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "medium",
    isRead: false,
  },
  {
    id: `alert-humidity-high-2`,
    type: "humidity_high",
    message: "Ortam nemi yüksek (%72)",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "high",
    isRead: false,
  },
  {
    id: `alert-humidity-low-1`,
    type: "humidity_low",
    message: "Ortam nemi düşüşte (%45)",
    timestamp: new Date(Date.now() - 80 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "low",
    isRead: false,
  },
  {
    id: `alert-humidity-low-2`,
    type: "humidity_low",
    message: "Ortam nemi düşük (%40)",
    timestamp: new Date(Date.now() - 20 * 1000).toISOString(),
    deviceId: "device-001",
    severity: "medium",
    isRead: false,
  },
];

const getSeverityStyle = (severity: Alert["severity"]) => {
  switch (severity) {
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "medium":
      return "text-orange-700 bg-orange-50 border-orange-200";
    default:
      return "text-green-700 bg-green-50 border-green-200";
  }
};

const getTypeEmoji = (type: Alert["type"]) => {
  if (type.includes("body_temp")) return "🌡️";
  if (type.includes("humidity")) return "💧";
  if (type.includes("temperature")) return "🔥";
  return "⚠️";
};

export default function Alerts() {
  const [timeRange, setTimeRange] = useState<number>(40); // dakika
  // Uyarıları bir araya getir (mockAlerts + örnek akış)
  const alerts: Alert[] = useMemo(() => {
    // Yeni olanlar üstte görünsün
    const merged = [...tempFlowExamples, ...humidityExamples, ...mockAlerts];
    return merged.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, []);

  // Bebek vücut sıcaklığı grafik verisi (mockSensorData'dan)
  const chartData = useMemo(
    () =>
      mockSensorData
        .slice()
        .reverse()
        .filter((d) => {
          const diffMin = (Date.now() - new Date(d.timestamp).getTime()) / 60000;
          return diffMin <= timeRange;
        })
        .map((d) => ({
          time: new Date(d.timestamp).toLocaleTimeString("tr-TR"),
          bodyTemp: d.bodyTemperature,
          humidity: d.humidity,
          temperature: d.temperature,
        })),
    [timeRange]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Uyarılar
        </h1>
        <p className="text-gray-600">
          Bebek sıcaklığının yükselip düşmesine dair örnek uyarılar ve sistem bildirimleri
        </p>
      </div>

      {/* Örnek akış görsel kartı */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Baby size={20} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Bebek Sıcaklığı Akışı (Örnek)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tempFlowExamples.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-lg border transition-colors ${getSeverityStyle(
                a.severity
              )}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {a.severity === "high"
                    ? "Acil"
                    : a.severity === "medium"
                    ? "Orta"
                    : "Düşük"}
                </span>
              </div>
              <p className="text-sm text-gray-800">
                {getTypeEmoji(a.type)} {a.message}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock size={12} />
                {new Date(a.timestamp).toLocaleTimeString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nem akışı örnek kartı */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-cyan-50 p-2 rounded-lg">
            <Droplets size={20} className="text-cyan-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Nem Akışı (Örnek)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {humidityExamples.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-lg border transition-colors ${getSeverityStyle(
                a.severity
              )}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {a.severity === "high"
                    ? "Acil"
                    : a.severity === "medium"
                    ? "Orta"
                    : "Düşük"}
                </span>
              </div>
              <p className="text-sm text-gray-800">
                {getTypeEmoji(a.type)} {a.message}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock size={12} />
                {new Date(a.timestamp).toLocaleTimeString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tüm uyarılar listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tüm Uyarılar</h2>
          </div>
          <span className="text-xs text-gray-500">Toplam: {alerts.length}</span>
        </div>

        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {getTypeEmoji(alert.type)} {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString("tr-TR")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded border ${getSeverityStyle(
                    alert.severity
                  )}`}
                >
                  {alert.severity === "high"
                    ? "Acil"
                    : alert.severity === "medium"
                    ? "Orta"
                    : "Düşük"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bebek Vücut Sıcaklığı Grafiği */}
      {/* Zaman aralığı seçici */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Zaman Aralığı:</span>
        {[20, 40, 60].map((m) => (
          <button
            key={m}
            onClick={() => setTimeRange(m)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              timeRange === m
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {m} dk
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Bebek Vücut Sıcaklığı (Grafik)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Son örnek ölçümlere göre vücut sıcaklığı trendi
        </p>
        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis domain={[35, 38]} stroke="#6b7280" label={{ value: "°C", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => [`${(value as number).toFixed(1)}°C`, "Vücut Sıcaklığı"]}
              />
              <Legend />
              <Line type="monotone" dataKey="bodyTemp" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} name="Vücut Sıcaklığı" />
              <ReferenceLine y={defaultThresholds.bodyTemperature.min} stroke="#10b981" strokeDasharray="5 5" ifOverflow="extendDomain" label={{ value: "Min Normal", position: "left", fill: "#10b981" }} />
              <ReferenceLine y={defaultThresholds.bodyTemperature.max} stroke="#f59e0b" strokeDasharray="5 5" ifOverflow="extendDomain" label={{ value: "Max Normal", position: "left", fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ortam Sıcaklığı Grafiği */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔥 Ortam Sıcaklığı (Grafik)</h2>
        <p className="text-sm text-gray-600 mb-4">Son örnek ölçümlere göre oda sıcaklığı trendi</p>
        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis domain={[20, 28]} stroke="#6b7280" label={{ value: "°C", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => [`${(value as number).toFixed(1)}°C`, "Ortam Sıcaklığı"]}
              />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="Ortam Sıcaklığı" />
              <ReferenceLine y={defaultThresholds.temperature.min} stroke="#10b981" strokeDasharray="5 5" ifOverflow="extendDomain" label={{ value: "Min Normal", position: "left", fill: "#10b981" }} />
              <ReferenceLine y={defaultThresholds.temperature.max} stroke="#f59e0b" strokeDasharray="5 5" ifOverflow="extendDomain" label={{ value: "Max Normal", position: "left", fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nem Oranı Grafiği */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💧 Nem Oranı (Grafik)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Son örnek ölçümlere göre ortam nemi trendi
        </p>
        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis domain={[35, 75]} stroke="#6b7280" label={{ value: "%", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => [`${(value as number).toFixed(1)}%`, "Nem Oranı"]}
              />
              <Legend />
              <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 4 }} name="Nem (%)" />
              <ReferenceLine y={defaultThresholds.humidity.min} stroke="#10b981" strokeDasharray="5 5" ifOverflow="extendDomain" label={{ value: "Min Normal", position: "left", fill: "#10b981" }} />
              <ReferenceLine y={defaultThresholds.humidity.max} stroke="#f59e0b" strokeDasharray="5 5" ifOverflow="extendDomain" label={{ value: "Max Normal", position: "left", fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
