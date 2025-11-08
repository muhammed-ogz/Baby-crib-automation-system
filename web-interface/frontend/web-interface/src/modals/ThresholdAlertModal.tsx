import {
  AlertTriangle,
  Droplets,
  Heart,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface ThresholdAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "temperature" | "humidity" | "bodyTemperature";
  value: number;
  threshold: { min: number; max: number };
  deviceName: string;
}

export default function ThresholdAlertModal({
  isOpen,
  onClose,
  type,
  value,
  threshold,
  deviceName,
}: ThresholdAlertModalProps) {
  if (!isOpen) return null;

  // Tip konfigürasyonu
  const getTypeConfig = () => {
    switch (type) {
      case "temperature":
        return {
          icon: Thermometer,
          title: "Ortam Sıcaklığı Uyarısı",
          unit: "°C",
          color: "blue",
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600",
          suggestion:
            "Ortam sıcaklığını kontrol edin ve gerekirse klima/ısıtma ayarlarını düzenleyin.",
        };
      case "humidity":
        return {
          icon: Droplets,
          title: "Ortam Nemi Uyarısı",
          unit: "%",
          color: "cyan",
          bgColor: "bg-cyan-50",
          iconColor: "text-cyan-600",
          suggestion:
            "Nem seviyesini kontrol edin. Gerekirse nem alıcı veya buharlaştırıcı kullanın.",
        };
      case "bodyTemperature":
        return {
          icon: Heart,
          title: "Vücut Sıcaklığı Uyarısı",
          unit: "°C",
          color: "red",
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
          suggestion:
            "Bebeğin sıcaklığını kontrol edin. Gerekirse doktora danışın.",
        };
      default:
        return {
          icon: AlertTriangle,
          title: "Uyarı",
          unit: "",
          color: "orange",
          bgColor: "bg-orange-50",
          iconColor: "text-orange-600",
          suggestion: "Değer normal aralığın dışında.",
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  // Değer durumu kontrolü
  const isHigh = value > threshold.max;
  const isLow = value < threshold.min;
  const isNormal = !isHigh && !isLow;

  // Durum rengini belirle
  const getStatusColor = () => {
    if (isNormal) return "text-green-600 bg-green-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusText = () => {
    if (isHigh) return "Yüksek";
    if (isLow) return "Düşük";
    return "Normal";
  };

  const getStatusIcon = () => {
    if (isHigh) return <TrendingUp size={16} className="text-red-600" />;
    if (isLow) return <TrendingDown size={16} className="text-red-600" />;
    return null;
  };

  // Acil durum kontrolü
  const isEmergency = type === "bodyTemperature" && (value > 38 || value < 35);

  // Uyarıyı kapat ve toast bildirimini göster
  const handleClose = () => {
    onClose();

    if (isEmergency) {
      toast.error("ACİL DURUM: Bebek sıcaklığı kritik seviyede!", {
        duration: 6000,
        position: "top-center",
      });
    } else if (!isNormal) {
      toast.error(`Uyarı: ${config.title} normal aralık dışında`, {
        duration: 4000,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div
          className={`p-6 rounded-t-lg ${
            isEmergency ? "bg-red-500 text-white" : config.bgColor
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                isEmergency ? "bg-white bg-opacity-20" : "bg-white"
              }`}
            >
              <Icon
                size={24}
                className={isEmergency ? "text-white" : config.iconColor}
              />
            </div>
            <div>
              <h2
                className={`text-lg font-semibold ${
                  isEmergency ? "text-white" : "text-gray-900"
                }`}
              >
                {isEmergency ? "ACİL DURUM!" : config.title}
              </h2>
              <p
                className={`text-sm ${
                  isEmergency ? "text-red-100" : "text-gray-600"
                }`}
              >
                {deviceName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Değer Gösterimi */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {value.toFixed(1)}
                {config.unit}
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </div>

            {/* Normal Aralık */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Normal Aralık</h4>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <span>
                  {threshold.min.toFixed(1)}
                  {config.unit}
                </span>
                <span>-</span>
                <span>
                  {threshold.max.toFixed(1)}
                  {config.unit}
                </span>
              </div>
            </div>

            {/* Öneriler */}
            {!isNormal && (
              <div
                className={`p-4 rounded-lg border ${
                  isEmergency
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h4
                  className={`font-medium mb-2 ${
                    isEmergency ? "text-red-900" : "text-yellow-900"
                  }`}
                >
                  {isEmergency ? "Acil Öneri" : "Öneriler"}
                </h4>
                <p
                  className={`text-sm ${
                    isEmergency ? "text-red-800" : "text-yellow-800"
                  }`}
                >
                  {isEmergency
                    ? "Hemen doktora başvurun! Bebek sıcaklığı kritik seviyede."
                    : config.suggestion}
                </p>
              </div>
            )}

            {/* Zaman Bilgisi */}
            <div className="text-sm text-gray-500 text-center">
              Ölçüm zamanı: {new Date().toLocaleTimeString("tr-TR")}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Kapat
          </button>

          {isEmergency && (
            <button
              onClick={() => {
                // Acil durum aksiyonu - örneğin doktor çağırma
                toast.success("Acil durum bildirimi gönderildi");
                handleClose();
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Acil Bildirim Gönder
            </button>
          )}

          {!isEmergency && !isNormal && (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Anladım
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
