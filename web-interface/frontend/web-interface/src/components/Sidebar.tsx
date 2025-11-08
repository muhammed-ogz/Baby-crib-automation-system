import { Activity, AlertTriangle, Home, Settings, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { mockDashboardStats } from "../mock-up-datas/data";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    {
      path: "/",
      label: "Ana Sayfa",
      icon: Home,
      badge: null,
    },
    {
      path: "/alerts",
      label: "Uyarılar",
      icon: AlertTriangle,
      badge:
        mockDashboardStats.unreadAlerts > 0
          ? mockDashboardStats.unreadAlerts
          : null,
    },
    {
      path: "/activity",
      label: "Aktivite",
      icon: Activity,
      badge: null,
    },
    {
      path: "/settings",
      label: "Ayarlar",
      icon: Settings,
      badge: null,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarClasses = `
    fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-50 transform transition-all duration-500 ease-in-out
    ${
      isMobile
        ? isOpen
          ? "translate-x-0"
          : "-translate-x-full"
        : "translate-x-0"
    }
    ${!isMobile ? "relative shadow-none z-auto" : ""}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-end p-4 border-b border-gray-200 animate-in slide-in-from-top-4 fade-in duration-300 delay-150">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 hover:rotate-90"
              aria-label="Menüyü kapat"
            >
              <X
                size={20}
                className="text-gray-600 transition-transform duration-200 ease-in-out"
              />
            </button>
          </div>
        )}

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out relative group
                  ${
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm transform scale-[1.02]"
                      : "text-gray-700 hover:bg-gray-50 hover:shadow-sm hover:transform hover:scale-[1.01]"
                  }
                  ${
                    isMobile && isOpen
                      ? `animate-in slide-in-from-left-8 fade-in duration-300 ease-out`
                      : ""
                  }
                `}
                style={
                  isMobile && isOpen
                    ? { animationDelay: `${index * 50}ms` }
                    : {}
                }
              >
                <Icon
                  size={20}
                  className={`transition-all duration-200 ease-in-out group-hover:scale-110 ${
                    active
                      ? "text-blue-700"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
                <span className="font-medium">{item.label}</span>

                {/* Badge */}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Cihaz Durumu */}
        <div
          className={`mt-auto p-4 border-t border-gray-200 ${
            isMobile && isOpen
              ? "animate-in slide-in-from-bottom-4 fade-in duration-400 delay-300"
              : ""
          }`}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors duration-200 ease-in-out">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Sistem Aktif
              </span>
            </div>
            <p className="text-xs text-green-700">
              {mockDashboardStats.activeDevices}/
              {mockDashboardStats.totalDevices} cihaz çalışıyor
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
