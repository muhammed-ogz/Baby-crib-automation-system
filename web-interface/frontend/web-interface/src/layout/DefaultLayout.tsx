import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // Masaüstünde sidebar her zaman açık
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar onMenuToggle={toggleSidebar} isMobile={isMobile} />

      <div className="flex flex-1 relative">
        {/* Mobile Blur Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ease-in-out"
            onClick={closeSidebar}
            style={{ top: "64px" }} // Navbar yüksekliği kadar aşağıdan başla
          />
        )}

        {/* Sidebar - Masaüstünde her zaman görünür */}
        {(!isMobile || sidebarOpen) && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            isMobile={isMobile}
          />
        )}

        {/* Ana İçerik Alanı */}
        <main
          className={`
            flex-1 flex flex-col transition-all duration-300 ease-in-out
            ${!isMobile && sidebarOpen ? "ml-0" : "ml-0"}
          `}
        >
          {/* Sayfa İçeriği */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
