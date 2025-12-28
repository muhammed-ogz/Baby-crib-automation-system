import {
  AlertTriangle,
  Droplets,
  Heart,
  Thermometer,
  Wifi,
  X,
} from "lucide-react";
import type { Alert } from "../types/data";
import { ALERT_TYPES } from "../types/data";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert;
}

export default function AlertModal({
  isOpen,
  onClose,
  alert,
}: AlertModalProps) {
  if (!isOpen) return null;

  // Alert tipine göre ikon ve renk belirleme
  const getAlertConfig = (type: string) => {
    switch (type) {
      case ALERT_TYPES.TEMPERATURE_HIGH:
      case ALERT_TYPES.TEMPERATURE_LOW:
        return {
          icon: Thermometer,
          color: "red",
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
          borderColor: "border-red-200",
        };
      case ALERT_TYPES.HUMIDITY_HIGH:
      case ALERT_TYPES.HUMIDITY_LOW:
        return {
          icon: Droplets,
          color: "blue",
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600",
          borderColor: "border-blue-200",
        };
      case ALERT_TYPES.BODY_TEMP_HIGH:
      case ALERT_TYPES.BODY_TEMP_LOW:
        return {
          icon: Heart,
          color: "red",
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
          borderColor: "border-red-200",
        };
      case ALERT_TYPES.DEVICE_OFFLINE:
        return {
          icon: Wifi,
          color: "gray",
          bgColor: "bg-gray-50",
          iconColor: "text-gray-600",
          borderColor: "border-gray-200",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "orange",
          bgColor: "bg-orange-50",
          iconColor: "text-orange-600",
          borderColor: "border-orange-200",
        };
    }
  };

  const config = getAlertConfig(alert.type);
  const Icon = config.icon;

  // Önem seviyesine göre başlık rengi
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "Yüksek Öncelik";
      case "medium":
        return "Orta Öncelik";
      case "low":
        return "Düşük Öncelik";
      default:
        return "Bilinmeyen";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}
            >
              <Icon size={24} className={config.iconColor} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Uyarı</h2>
              <p
                className={`text-sm font-medium ${getSeverityColor(
                  alert.severity
                )}`}
              >
                {getSeverityText(alert.severity)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Kapat"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Ana Mesaj */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Uyarı Mesajı</h3>
              <p className="text-gray-700">{alert.message}</p>
            </div>

            {/* Detaylar */}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Zaman:
                </span>
                <p className="text-gray-900">
                  {new Date(alert.timestamp).toLocaleString("tr-TR")}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  Cihaz ID:
                </span>
                <p className="text-gray-900 font-mono text-sm">
                  {alert.deviceId}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  Uyarı Türü:
                </span>
                <p className="text-gray-900">{alert.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tamam
          </button>

          <button
            onClick={() => {
              // Burada uyarıyı "okundu" olarak işaretleme logic'i olacak
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
              alert.severity === "high"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Okundu Olarak İşaretle
          </button>
        </div>
      </div>
    </div>
  );
}
