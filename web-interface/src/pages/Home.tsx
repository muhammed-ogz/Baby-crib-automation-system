import {
  AlertTriangle,
  CheckCircle,
  Droplets,
  Heart,
  Thermometer,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSensorData } from "../hooks/useSensorData";
import { defaultThresholds } from "../mock-up-datas/data";
import type { SensorData } from "../types/data";

export default function Home() {
  const { sensorData, isConnected, isLoading, error } = useSensorData();
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const deviceName = "ESP32 Bebek Beşik Sensörü";
  const [chartData, setChartData] = useState<
    Array<{
      time: string;
      bodyTemp: number;
      timestamp: string;
    }>
  >([]);

  // Update current data when sensor data changes
  useEffect(() => {
    if (sensorData) {
      const newDataPoint = {
        id: sensorData.id,
        deviceId: sensorData.deviceId,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        bodyTemperature: sensorData.bodyTemperature,
        timestamp: sensorData.timestamp,
      };

      setCurrentData(newDataPoint);

      // Update chart data (keep last 40 minutes = 480 data points at 5s interval)
      setChartData((prev) => {
        const newChart = [
          ...prev,
          {
            time: new Date(sensorData.timestamp).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            bodyTemp: sensorData.bodyTemperature,
            timestamp: new Date(sensorData.timestamp).toLocaleTimeString(
              "tr-TR"
            ),
          },
        ];

        // Keep only last 480 data points (40 minutes)
        if (newChart.length > 480) {
          return newChart.slice(-480);
        }
        return newChart;
      });
    }
  }, [sensorData]);

  // Değer durumu kontrolü
  const getValueStatus = (value: number, min: number, max: number) => {
    if (value < min) return "low";
    if (value > max) return "high";
    return "normal";
  };

  const tempStatus = currentData
    ? getValueStatus(
        currentData.temperature,
        defaultThresholds.temperature.min,
        defaultThresholds.temperature.max
      )
    : "normal";
  const humidityStatus = currentData
    ? getValueStatus(
        currentData.humidity,
        defaultThresholds.humidity.min,
        defaultThresholds.humidity.max
      )
    : "normal";
  const bodyTempStatus = currentData
    ? getValueStatus(
        currentData.bodyTemperature,
        defaultThresholds.bodyTemperature.min,
        defaultThresholds.bodyTemperature.max
      )
    : "normal";

  // Durum renklerini belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Ana Sayfa
        </h1>
        <p className="text-gray-600">
          Bebek izleme sisteminin anlık durumu ve ölçüm değerleri
        </p>
      </div>

      {/* Bağlantı Durumu */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <WifiOff size={20} className="text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {isLoading ? "Sunucuya bağlanılıyor..." : "Sunucu bağlantısı yok"}
            </p>
            {error && <p className="text-xs text-yellow-600 mt-1">{error}</p>}
          </div>
        </div>
      )}

      {/* Cihaz Durumu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300 hover:transform hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {deviceName}
            </h2>
            {currentData && (
              <p className="text-xs text-gray-500 mt-1">
                Son güncelleme: {formatTime(currentData.timestamp)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                isConnected
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              }`}
            >
              {isConnected ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span className="text-sm font-medium">
                {isConnected ? "Çalışıyor" : "Bağlantı Yok"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              {isConnected ? (
                <>
                  <Wifi size={16} className="text-green-600" />
                  <span className="text-green-600">Bağlı</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} className="text-red-600" />
                  <span className="text-red-600">Bağlı Değil</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sensör Verileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ortam Sıcaklığı */}
        <div
          className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 ease-in-out hover:shadow-lg hover:transform hover:scale-105 cursor-pointer group ${getStatusColor(
            tempStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg transition-transform duration-200 ease-in-out group-hover:scale-110">
                <Thermometer
                  size={24}
                  className="text-blue-600 transition-colors duration-200 ease-in-out group-hover:text-blue-700"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ortam Sıcaklığı</h3>
                <p className="text-sm text-gray-600">Oda sıcaklığı</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {currentData ? currentData.temperature.toFixed(1) : "--"}°C
            </div>
            <div className="text-sm text-gray-600">
              Normal aralık: {defaultThresholds.temperature.min}°C -{" "}
              {defaultThresholds.temperature.max}°C
            </div>
            {currentData && (
              <div className="text-xs text-gray-500">
                Son güncelleme: {formatTime(currentData.timestamp)}
              </div>
            )}
          </div>
        </div>

        {/* Ortam Nemi */}
        <div
          className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 ease-in-out hover:shadow-lg hover:transform hover:scale-105 cursor-pointer group ${getStatusColor(
            humidityStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 p-3 rounded-lg transition-transform duration-200 ease-in-out group-hover:scale-110">
                <Droplets
                  size={24}
                  className="text-cyan-600 transition-colors duration-200 ease-in-out group-hover:text-cyan-700"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ortam Nemi</h3>
                <p className="text-sm text-gray-600">Hava nem oranı</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              %{currentData ? currentData.humidity.toFixed(1) : "--"}
            </div>
            <div className="text-sm text-gray-600">
              Normal aralık: %{defaultThresholds.humidity.min} - %
              {defaultThresholds.humidity.max}
            </div>
            {currentData && (
              <div className="text-xs text-gray-500">
                Son güncelleme: {formatTime(currentData.timestamp)}
              </div>
            )}
          </div>
        </div>

        {/* Bebek Vücut Sıcaklığı */}
        <div
          className={`bg-white rounded-lg shadow-sm border p-6 md:col-span-2 lg:col-span-1 transition-all duration-200 ease-in-out hover:shadow-lg hover:transform hover:scale-105 cursor-pointer group ${getStatusColor(
            bodyTempStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg transition-transform duration-200 ease-in-out group-hover:scale-110">
                <Heart
                  size={24}
                  className="text-red-600 transition-colors duration-200 ease-in-out group-hover:text-red-700"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Vücut Sıcaklığı</h3>
                <p className="text-sm text-gray-600">Bebek sıcaklığı</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {currentData ? currentData.bodyTemperature.toFixed(1) : "--"}°C
            </div>
            <div className="text-sm text-gray-600">
              Normal aralık: {defaultThresholds.bodyTemperature.min}°C -{" "}
              {defaultThresholds.bodyTemperature.max}°C
            </div>
            {currentData && (
              <div className="text-xs text-gray-500">
                Son güncelleme: {formatTime(currentData.timestamp)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Son Ölçümler Özeti */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sistem Durumu
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-100 hover:transform hover:scale-105 cursor-pointer">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-600">Aktif Cihaz</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg transition-all duration-200 ease-in-out hover:bg-green-100 hover:transform hover:scale-105 cursor-pointer">
            <div className="text-2xl font-bold text-green-600">
              {tempStatus === "normal" &&
              humidityStatus === "normal" &&
              bodyTempStatus === "normal"
                ? "✓"
                : "!"}
            </div>
            <div className="text-sm text-gray-600">Durum</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg transition-all duration-200 ease-in-out hover:bg-blue-100 hover:transform hover:scale-105 cursor-pointer">
            <div className="text-2xl font-bold text-blue-600">5s</div>
            <div className="text-sm text-gray-600">Güncelleme</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg transition-all duration-200 ease-in-out hover:bg-purple-100 hover:transform hover:scale-105 cursor-pointer">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">İzleme</div>
          </div>
        </div>
      </div>

      {/* Bebek Vücut Sıcaklığı Grafik Sayfası */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Bebek Vücut Sıcaklığı Grafiği
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Son 40 dakika içindeki vücut sıcaklığı değişimleri
        </p>

        <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[20, 40]}
                stroke="#6b7280"
                label={{
                  value: "Sıcaklık (°C)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={(value) => `${value}°C`}
                ticks={[20, 25, 30, 35, 40]}
                allowDataOverflow={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `${value.toFixed(1)}°C`,
                  "Vücut Sıcaklığı",
                ]}
                labelFormatter={(label) => `Saat: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="bodyTemp"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
                name="Vücut Sıcaklığı"
              />
              {/* Normal aralık gösterileri */}
              <Line
                type="linear"
                dataKey={() => defaultThresholds.bodyTemperature.min}
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Min Normal"
              />
              <Line
                type="linear"
                dataKey={() => defaultThresholds.bodyTemperature.max}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Max Normal"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-gray-600">Normal Aralık</p>
            <p className="font-semibold text-green-700">
              {defaultThresholds.bodyTemperature.min}°C -{" "}
              {defaultThresholds.bodyTemperature.max}°C
            </p>
          </div>
          {chartData.length > 0 && (
            <>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-gray-600">En Yüksek Kayıt</p>
                <p className="font-semibold text-red-700">
                  {Math.max(...chartData.map((d) => d.bodyTemp)).toFixed(1)}°C
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-600">En Düşük Kayıt</p>
                <p className="font-semibold text-blue-700">
                  {Math.min(...chartData.map((d) => d.bodyTemp)).toFixed(1)}°C
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
