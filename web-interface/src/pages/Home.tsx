import {
  AlertTriangle,
  CheckCircle,
  Droplets,
  Heart,
  Thermometer,
  Wifi,
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
import { useAlertToast } from "../hooks/useAlertToast";
import {
  defaultThresholds,
  generateRandomSensorData,
  mockAlerts,
  mockDevices,
  mockSensorData,
} from "../mock-up-datas/data";
import type { Device, SensorData } from "../types/data";
import { DEVICE_STATUS } from "../types/data";

export default function Home() {
  const [currentData, setCurrentData] = useState<SensorData>(mockSensorData[0]);
  const [device] = useState<Device>(mockDevices[0]);
  const [chartData, setChartData] = useState(
    mockSensorData
      .slice()
      .reverse()
      .map((data, index) => ({
        time: `${index * 5}m`,
        bodyTemp: data.bodyTemperature,
        timestamp: new Date(data.timestamp).toLocaleTimeString("tr-TR"),
      }))
  );

  // Alert toast hook'unu kullan
  useAlertToast(mockAlerts);

  // Backend'den veri çekme
  const fetchSensorData = async () => {
    try {
      // URL'den parametreleri al (örnek olarak sabit değerler)
      const params = new URLSearchParams(window.location.search);
      const temperature = params.get('temperature') || '22';
      const humidity = params.get('humidity') || '60';
      const babyTemperature = params.get('babyTemperature') || '36.5';

      const response = await fetch(
        `http://localhost:3001/v1/values?temperature=${temperature}&humidity=${humidity}&babyTemperature=${babyTemperature}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCurrentData({
          id: currentData.id,
          deviceId: currentData.deviceId,
          temperature: parseFloat(data.temperature),
          humidity: parseFloat(data.humidity),
          bodyTemperature: parseFloat(data.babyTemperature),
          timestamp: data.timestamp,
        });
      }
    } catch (error) {
      // Backend bağlantısı yoksa mock veri kullan
      console.log('Backend bağlantısı yok, mock veri kullanılıyor');
      const newData = generateRandomSensorData();
      setCurrentData(newData);
    }
  };

  // Gerçek zamanlı veri simülasyonu
  useEffect(() => {
    fetchSensorData(); // İlk yüklemede veri çek
    
    const interval = setInterval(() => {
      fetchSensorData();
    }, 5000); // 5 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  // Değer durumu kontrolü
  const getValueStatus = (value: number, min: number, max: number) => {
    if (value < min) return "low";
    if (value > max) return "high";
    return "normal";
  };

  const tempStatus = getValueStatus(
    currentData.temperature,
    defaultThresholds.temperature.min,
    defaultThresholds.temperature.max
  );
  const humidityStatus = getValueStatus(
    currentData.humidity,
    defaultThresholds.humidity.min,
    defaultThresholds.humidity.max
  );
  const bodyTempStatus = getValueStatus(
    currentData.bodyTemperature,
    defaultThresholds.bodyTemperature.min,
    defaultThresholds.bodyTemperature.max
  );

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

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case DEVICE_STATUS.WORKING:
        return "text-green-600 bg-green-50";
      case DEVICE_STATUS.DISABLED:
        return "text-yellow-600 bg-yellow-50";
      case DEVICE_STATUS.ERROR:
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getDeviceStatusText = (status: string) => {
    switch (status) {
      case DEVICE_STATUS.WORKING:
        return "Çalışıyor";
      case DEVICE_STATUS.DISABLED:
        return "Devre Dışı";
      case DEVICE_STATUS.ERROR:
        return "Sistemsel Arıza";
      default:
        return "Bilinmeyen";
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

      {/* Cihaz Durumu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300 hover:transform hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {device.name}
            </h2>
            <p className="text-sm text-gray-600">
              Konum: {device.location} • WiFi: {device.wifiSSID}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${getDeviceStatusColor(
                device.status
              )}`}
            >
              {device.status === DEVICE_STATUS.WORKING ? (
                <CheckCircle size={16} />
              ) : device.status === DEVICE_STATUS.DISABLED ? (
                <AlertTriangle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span className="text-sm font-medium">
                {getDeviceStatusText(device.status)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Wifi size={16} />
              <span>Bağlı</span>
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
              {currentData.temperature.toFixed(1)}°C
            </div>
            <div className="text-sm text-gray-600">
              Normal aralık: {defaultThresholds.temperature.min}°C -{" "}
              {defaultThresholds.temperature.max}°C
            </div>
            <div className="text-xs text-gray-500">
              Son güncelleme: {formatTime(currentData.timestamp)}
            </div>
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
              %{currentData.humidity.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Normal aralık: %{defaultThresholds.humidity.min} - %
              {defaultThresholds.humidity.max}
            </div>
            <div className="text-xs text-gray-500">
              Son güncelleme: {formatTime(currentData.timestamp)}
            </div>
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
              {currentData.bodyTemperature.toFixed(1)}°C
            </div>
            <div className="text-sm text-gray-600">
              Normal aralık: {defaultThresholds.bodyTemperature.min}°C -{" "}
              {defaultThresholds.bodyTemperature.max}°C
            </div>
            <div className="text-xs text-gray-500">
              Son güncelleme: {formatTime(currentData.timestamp)}
            </div>
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
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis
                domain={[35, 38]}
                stroke="#6b7280"
                label={{ value: "°C", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value.toFixed(1)}°C`, "Vücut Sıcaklığı"]}
                labelFormatter={(label) => `${label} önce`}
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
        </div>
      </div>
    </div>
  );
}
