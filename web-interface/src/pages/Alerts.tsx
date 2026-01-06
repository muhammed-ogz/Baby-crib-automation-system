import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useSensorData } from "../hooks/useSensorData";
import { defaultThresholds } from "../mock-up-datas/data";
import type { SensorData } from "../types/data";

type AlertSeverity = "low" | "medium" | "high";
type AlertType =
  | "body_temp_high"
  | "body_temp_low"
  | "humidity_high"
  | "humidity_low"
  | "temperature_high"
  | "temperature_low";

interface DisplayAlert {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  deviceId: string;
  severity: AlertSeverity;
  isRead: boolean;
}

const getSeverityStyle = (severity: AlertSeverity) => {
  switch (severity) {
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "medium":
      return "text-orange-700 bg-orange-50 border-orange-200";
    default:
      return "text-green-700 bg-green-50 border-green-200";
  }
};

const getTypeEmoji = (type: string) => {
  if (type.includes("body_temp")) return "🌡️";
  if (type.includes("humidity")) return "💧";
  if (type.includes("temperature")) return "🔥";
  return "⚠️";
};

export default function Alerts() {
  const { sensorData } = useSensorData();
  const [timeRange, setTimeRange] = useState<number>(40); // dakika
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [alertHistory, setAlertHistory] = useState<DisplayAlert[]>([]);

  // Sensör verilerini ve alert'leri sakla
  useEffect(() => {
    if (sensorData) {
      setSensorHistory((prev) => {
        const newHistory = [sensorData, ...prev];
        return newHistory.slice(0, 500); // Son 500 kayıt
      });

      // Alert varsa kaydet
      if (sensorData.alerts && sensorData.alerts.length > 0) {
        const newAlerts: DisplayAlert[] = sensorData.alerts.map(
          (alert, idx) => ({
            id: `alert-${sensorData.timestamp}-${idx}`,
            type: alert.type as AlertType,
            message: getAlertMessage(alert.type, alert.value, alert.threshold),
            timestamp: sensorData.timestamp,
            deviceId: sensorData.deviceId,
            severity: alert.type.includes("body_temp") ? "high" : "medium",
            isRead: false,
          })
        );

        setAlertHistory((prev) => {
          const merged = [...newAlerts, ...prev];
          return merged.slice(0, 100); // Son 100 alert
        });
      }
    }
  }, [sensorData]);

  const getAlertMessage = (
    type: string,
    value: number,
    threshold: { min?: number; max?: number }
  ) => {
    const messages: Record<string, string> = {
      temperature_high: `Yüksek ortam sıcaklığı: ${value.toFixed(
        1
      )}°C (Normal: ${threshold.min}-${threshold.max}°C)`,
      temperature_low: `Düşük ortam sıcaklığı: ${value.toFixed(1)}°C (Normal: ${
        threshold.min
      }-${threshold.max}°C)`,
      humidity_high: `Yüksek nem: ${value.toFixed(1)}% (Normal: ${
        threshold.min
      }-${threshold.max}%)`,
      humidity_low: `Düşük nem: ${value.toFixed(1)}% (Normal: ${
        threshold.min
      }-${threshold.max}%)`,
      body_temp_high: `Yüksek vücut sıcaklığı: ${value.toFixed(1)}°C (Normal: ${
        threshold.min
      }-${threshold.max}°C)`,
      body_temp_low: `Düşük vücut sıcaklığı: ${value.toFixed(1)}°C (Normal: ${
        threshold.min
      }-${threshold.max}°C)`,
    };
    return messages[type] || `Uyarı: ${type}`;
  };

  // Grafik verisi - son timeRange dakikalık data
  const chartData = useMemo(
    () =>
      sensorHistory
        .filter((d) => {
          const diffMin =
            (Date.now() - new Date(d.timestamp).getTime()) / 60000;
          return diffMin <= timeRange;
        })
        .reverse()
        .map((d) => ({
          time: new Date(d.timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          bodyTemp: d.bodyTemperature,
          humidity: d.humidity,
          temperature: d.temperature,
        })),
    [sensorHistory, timeRange]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Uyarılar
        </h1>
        <p className="text-gray-600">
          Sensör uyarıları ve gerçek zamanlı veriler
        </p>
      </div>

      {/* Uyarı Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Tüm Uyarılar
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            Toplam: {alertHistory.length}
          </span>
        </div>

        {alertHistory.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
            <p>Henüz uyarı bulunmuyor</p>
            <p className="text-sm mt-2">
              Threshold değerlerinin dışına çıkıldığında uyarılar burada
              görünecek
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alertHistory.map((alert) => (
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
        )}
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
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                domain={[34, 39]}
                ticks={[34, 35, 36, 37, 38, 39]}
                stroke="#6b7280"
                label={{
                  value: "Sıcaklık (°C)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "14px" },
                }}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px",
                }}
                formatter={(value) => [
                  `${(value as number).toFixed(1)}°C`,
                  "Vücut Sıcaklığı",
                ]}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Line
                type="monotone"
                dataKey="bodyTemp"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                name="Vücut Sıcaklığı"
              />
              <ReferenceLine
                y={defaultThresholds.bodyTemperature.min}
                stroke="#10b981"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Min Normal",
                  position: "left",
                  fill: "#10b981",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={defaultThresholds.bodyTemperature.max}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Max Normal",
                  position: "left",
                  fill: "#f59e0b",
                  fontSize: 12,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ortam Sıcaklığı Grafiği */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🔥 Ortam Sıcaklığı (Grafik)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Son örnek ölçümlere göre oda sıcaklığı trendi
        </p>
        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                domain={[18, 30]}
                ticks={[18, 20, 22, 24, 26, 28, 30]}
                stroke="#6b7280"
                label={{
                  value: "Sıcaklık (°C)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "14px" },
                }}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px",
                }}
                formatter={(value) => [
                  `${(value as number).toFixed(1)}°C`,
                  "Ortam Sıcaklığı",
                ]}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                name="Ortam Sıcaklığı"
              />
              <ReferenceLine
                y={defaultThresholds.temperature.min}
                stroke="#10b981"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Min Normal",
                  position: "left",
                  fill: "#10b981",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={defaultThresholds.temperature.max}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Max Normal",
                  position: "left",
                  fill: "#f59e0b",
                  fontSize: 12,
                }}
              />
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
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                stroke="#6b7280"
                label={{
                  value: "Nem Oranı (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "14px" },
                }}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px",
                }}
                formatter={(value) => [
                  `${(value as number).toFixed(1)}%`,
                  "Nem Oranı",
                ]}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", r: 4 }}
                name="Nem (%)"
              />
              <ReferenceLine
                y={defaultThresholds.humidity.min}
                stroke="#10b981"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Min Normal",
                  position: "left",
                  fill: "#10b981",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={defaultThresholds.humidity.max}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Max Normal",
                  position: "left",
                  fill: "#f59e0b",
                  fontSize: 12,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
