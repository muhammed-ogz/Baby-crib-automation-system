import { Clock, Heart, Shield } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 py-6">
        {/* Ana İçerik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Proje Bilgisi */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Heart size={16} className="text-red-500" />
              Bebek İzleme Sistemi
            </h3>
            <p className="text-sm text-gray-600">
              Bebeğinizin sağlığını ve güvenliğini 7/24 izleyen akıllı sensör
              sistemi.
            </p>
          </div>

          {/* Güvenlik */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Shield size={16} className="text-blue-500" />
              Güvenlik
            </h3>
            <p className="text-sm text-gray-600">
              Verileriniz güvenli ve şifrelidir. Kişisel bilgileriniz korunur.
            </p>
          </div>

          {/* Destek */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Clock size={16} className="text-green-500" />
              Destek
            </h3>
            <p className="text-sm text-gray-600">
              Teknik destek için: support@babymonitor.com
            </p>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Bebek İzleme Sistemi. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Versiyon 1.0.0</span>
              <span>•</span>
              <span>TÜBİTAK Projesi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
