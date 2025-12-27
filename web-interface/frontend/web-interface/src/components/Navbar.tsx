import { Baby, Bell, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { mockAlerts } from "../mock-up-datas/data";
import { mockUser } from "../mock-up-datas/user";
import toast from "react-hot-toast";

interface NavbarProps {
  onMenuToggle: () => void;
  isMobile: boolean;
}

export default function Navbar({ onMenuToggle, isMobile }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);

  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    // Tüm okulanmamış bildirimleri okundu olarak işaretle
    if (!showNotifications) {
      setAlerts(
        alerts.map((alert) => ({ ...alert, isRead: true }))
      );
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
    toast.success("Bildirim silindi");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Sol taraf - Logo ve Menu */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-md transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              aria-label="Menüyü aç"
            >
              <Menu
                size={20}
                className="text-gray-600 transition-transform duration-200 ease-in-out"
              />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-blue-100 hover:scale-110 cursor-pointer">
              <Baby
                size={24}
                className="text-blue-600 transition-colors duration-200 ease-in-out hover:text-blue-700"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-800">
                Bebek İzleme
              </h1>
              <p className="text-xs text-gray-500">Sağlık Takip Sistemi</p>
            </div>
          </div>
        </div>

        {/* Sağ taraf - Bildirimler ve Kullanıcı */}
        <div className="flex items-center gap-3">
          {/* Bildirimler */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="p-2 hover:bg-gray-100 rounded-md transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 relative"
              aria-label="Bildirimler"
            >
              <Bell
                size={20}
                className="text-gray-600 transition-transform duration-200 ease-in-out"
              />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Bildirimler Dropdown Paneli */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {/* Başlık */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Bildirimler</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Bildirim Listesi */}
                {alerts.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !alert.isRead ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`text-sm font-medium ${
                                  alert.severity === "high"
                                    ? "text-red-700"
                                    : alert.severity === "medium"
                                      ? "text-orange-700"
                                      : "text-green-700"
                                }`}
                              >
                                {alert.severity === "high"
                                  ? "🔴 Acil"
                                  : alert.severity === "medium"
                                    ? "🟡 Orta"
                                    : "🟢 Düşük"}
                              </p>
                              {!alert.isRead && (
                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString(
                                "tr-TR"
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">Bildirim bulunmuyor</p>
                  </div>
                )}

                {/* Butonlar */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
                  <button
                    onClick={() => {
                      setAlerts([]);
                      setShowNotifications(false);
                      toast.success("Tüm bildirimler temizlendi");
                    }}
                    className="w-full px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                  >
                    Tümünü Temizle
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Kullanıcı Profili */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {mockUser.avatar ? (
                <img
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User size={16} className="text-gray-600" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">
                {mockUser.name}
              </p>
              <p className="text-xs text-gray-500">{mockUser.email}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
