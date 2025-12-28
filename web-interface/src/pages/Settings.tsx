import {
  AlertTriangle,
  CheckCircle,
  Droplets,
  Heart,
  RefreshCw,
  Save,
  Thermometer,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { defaultThresholds, mockDevices } from "../mock-up-datas/data";
import type { Device, ThresholdSettings } from "../types/data";
import { DEVICE_STATUS } from "../types/data";

export default function Settings() {
  const [device] = useState<Device>(mockDevices[0]);
  const [thresholds, setThresholds] =
    useState<ThresholdSettings>(defaultThresholds);
  const [isSaving, setIsSaving] = useState(false);

  // Eşik değer güncelleme
  const updateThreshold = (
    category: keyof ThresholdSettings,
    type: "min" | "max",
    value: number
  ) => {
    setThresholds((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value,
      },
    }));
  };

  // Ayarları kaydetme simülasyonu
  const handleSave = async () => {
    setIsSaving(true);
    // Simülasyon için 1 saniye bekle
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Başarı bildirimi burada olacak (toast)
  };

  // Cihaz durumu rengi
  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case DEVICE_STATUS.WORKING:
        return "text-green-600 bg-green-50 border-green-200";
      case DEVICE_STATUS.DISABLED:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case DEVICE_STATUS.ERROR:
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case DEVICE_STATUS.WORKING:
        return <CheckCircle size={16} />;
      case DEVICE_STATUS.DISABLED:
      case DEVICE_STATUS.ERROR:
        return <AlertTriangle size={16} />;
      default:
        return <RefreshCw size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Ayarlar
        </h1>
        <p className="text-gray-600">
          Cihaz ayarları ve eşik değerlerini yönetin
        </p>
      </div>

      {/* Cihaz Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Cihaz Bilgileri
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cihaz Durumu */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cihaz Adı
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {device.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {device.location}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 ${getDeviceStatusColor(
                  device.status
                )}`}
              >
                {getDeviceStatusIcon(device.status)}
                <span className="font-medium">
                  {getDeviceStatusText(device.status)}
                </span>
              </div>
            </div>
          </div>

          {/* WiFi Bilgileri */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WiFi Ağı
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border flex items-center gap-2">
                <Wifi size={16} className="text-gray-600" />
                <span>{device.wifiSSID}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Son Görülme
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                {new Date(device.lastSeen).toLocaleString("tr-TR")}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cihaz ID
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm">
                {device.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eşik Değer Ayarları */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Uyarı Eşik Değerleri
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ortam Sıcaklığı */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Thermometer size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Ortam Sıcaklığı</h3>
                <p className="text-sm text-gray-600">°C cinsinden</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Değer
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.temperature.min}
                onChange={(e) =>
                  updateThreshold(
                    "temperature",
                    "min",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-gray-400 focus:transform focus:scale-[1.02]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Değer
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.temperature.max}
                onChange={(e) =>
                  updateThreshold(
                    "temperature",
                    "max",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ortam Nemi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Droplets size={20} className="text-cyan-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Ortam Nemi</h3>
                <p className="text-sm text-gray-600">% cinsinden</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Değer
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.humidity.min}
                onChange={(e) =>
                  updateThreshold("humidity", "min", parseFloat(e.target.value))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Değer
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.humidity.max}
                onChange={(e) =>
                  updateThreshold("humidity", "max", parseFloat(e.target.value))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Vücut Sıcaklığı */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Heart size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Vücut Sıcaklığı</h3>
                <p className="text-sm text-gray-600">°C cinsinden</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Değer
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.bodyTemperature.min}
                onChange={(e) =>
                  updateThreshold(
                    "bodyTemperature",
                    "min",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Değer
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.bodyTemperature.max}
                onChange={(e) =>
                  updateThreshold(
                    "bodyTemperature",
                    "max",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Değişiklikler otomatik olarak cihaza gönderilecektir.
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:transform hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              <Save size={16} />
              {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </div>
      </div>

      {/* Yardımcı Bilgiler */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Önerilen Değerler</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Ortam Sıcaklığı:</strong> 20-26°C arası bebek odası için
            idealdir
          </li>
          <li>
            • <strong>Ortam Nemi:</strong> %45-65 arası solunum sağlığı için
            uygundur
          </li>
          <li>
            • <strong>Vücut Sıcaklığı:</strong> 36-37°C arası normal bebek
            sıcaklığıdır
          </li>
        </ul>
      </div>
    </div>
  );
}
