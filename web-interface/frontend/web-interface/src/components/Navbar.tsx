import { Baby, Bell, Menu, User } from "lucide-react";
import { mockAlerts } from "../mock-up-datas/data";
import { mockUser } from "../mock-up-datas/user";

interface NavbarProps {
  onMenuToggle: () => void;
  isMobile: boolean;
}

export default function Navbar({ onMenuToggle, isMobile }: NavbarProps) {
  const unreadAlertsCount = mockAlerts.filter((alert) => !alert.isRead).length;

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
