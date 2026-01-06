# ===================================================================
# ESP32 Bebek Beşik Otomasyon Sistemi - Yapılandırma Dosyası
# ===================================================================
# Bu dosyayı config.py olarak kopyalayın ve değerleri düzenleyin
# Komut: cp config.example.py config.py
# ===================================================================

# WiFi Configuration
WIFI_SSID = "YOUR_WIFI_SSID"  # WiFi ağ adı
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"  # WiFi şifresi

# API Server Configuration
# Backend sunucunuzun IP adresi ve portu
# Örnekler:
#   - Yerel ağ: "http://192.168.1.100:3000"
#   - Raspberry Pi: "http://raspberrypi.local:3000"
#   - Cloud server: "https://your-domain.com:3000"
API_SERVER_URL = "http://192.168.1.100:3000"  # ⚠️ BU IP'Yİ DEĞİŞTİRİN!
API_ENDPOINT = "/api/sensors"

# Device Configuration
DEVICE_ID = "esp32-besik-01"  # ⚠️ Türkçe karakter KULLANMAYIN (ASCII only)

# Sensor Configuration
SEND_INTERVAL = 5  # Sensör verisi gönderim aralığı (saniye)
RETRY_ATTEMPTS = 3  # HTTP istek başarısız olursa tekrar deneme sayısı
RETRY_DELAY = 2  # Tekrar denemeler arası bekleme süresi (saniye)

# Buffer Configuration (WiFi kesintisinde veri kaybını önler)
BUFFER_MAX_SIZE = 50  # Maksimum tamponlanacak veri sayısı (~5 KB RAM)
# Not: 50 veri = 50 * 5 saniye = ~4 dakikalık offline veri

# WiFi Configuration
WIFI_TIMEOUT = 10  # WiFi bağlantı timeout süresi (saniye)
WIFI_RETRY_ATTEMPTS = 3  # Başlangıçta WiFi bağlantı deneme sayısı
WIFI_RETRY_DELAY = 2  # WiFi tekrar denemeler arası bekleme (saniye)

# NTP Configuration (Otomatik saat senkronizasyonu)
NTP_SERVER = "pool.ntp.org"  # NTP sunucusu
# Alternatifler: "time.google.com", "time.cloudflare.com", "tr.pool.ntp.org"
