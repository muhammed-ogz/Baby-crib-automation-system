# boot.py - ESP32 açılış yapılandırması
import gc
import time

import esp
import network

# Import WiFi configuration
try:
    from config import (
        NTP_SERVER,
        WIFI_PASSWORD,
        WIFI_RETRY_ATTEMPTS,
        WIFI_RETRY_DELAY,
        WIFI_SSID,
        WIFI_TIMEOUT,
    )
except ImportError:
    print("config.py not found! Please create it from config.example.py")
    WIFI_SSID = None
    WIFI_PASSWORD = None
    WIFI_TIMEOUT = 10
    WIFI_RETRY_DELAY = 2
    WIFI_RETRY_ATTEMPTS = 3
    NTP_SERVER = "pool.ntp.org"

# Debug mesajlarını kapat
esp.osdebug(None)

# Garbage collector'ı çalıştır
gc.collect()

print("\n" + "=" * 50)
print("ESP32 Başlatıldı - MicroPython")
print("=" * 50)

# Global WLAN nesnesi
wlan = None


def sync_time_with_ntp():
    """NTP sunucusu ile saat senkronizasyonu"""
    try:
        import ntptime

        print(f"🕒 NTP senkronizasyonu yapılıyor ({NTP_SERVER})...")
        ntptime.host = NTP_SERVER
        ntptime.settime()
        print("✓ NTP senkronizasyonu başarılı")

        # Şu anki zamanı göster
        import time

        t = time.localtime()
        print(
            f"   Tarih/Saat: {t[0]:04d}-{t[1]:02d}-{t[2]:02d} {t[3]:02d}:{t[4]:02d}:{t[5]:02d}"
        )
        return True
    except ImportError:
        print("⚠️  ntptime modülü bulunamadı")
        return False
    except Exception as e:
        print(f"⚠️  NTP senkronizasyonu başarısız: {e}")
        print("   Timestamp backend tarafından atanacak")
        return False


def connect_wifi():
    """WiFi bağlantısını başlat"""
    global wlan

    if not WIFI_SSID or not WIFI_PASSWORD:
        print("❌ WiFi credentials not configured!")
        return False

    # Global WLAN nesnesini oluştur (sadece bir kez)
    if wlan is None:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)

    if wlan.isconnected():
        print("✓ Already connected to WiFi")
        print(f"   IP: {wlan.ifconfig()[0]}")
        return True

    print(f"📡 Connecting to WiFi: {WIFI_SSID}")

    try:
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)

        # Wait for connection
        start_time = time.time()
        while not wlan.isconnected():
            if time.time() - start_time > WIFI_TIMEOUT:
                print("⏰ WiFi connection timeout!")
                return False
            print(".", end="")
            time.sleep(0.5)

        print("\n✅ WiFi connected!")
        print(f"   IP Address: {wlan.ifconfig()[0]}")
        print(f"   Subnet Mask: {wlan.ifconfig()[1]}")
        print(f"   Gateway: {wlan.ifconfig()[2]}")
        print(f"   DNS: {wlan.ifconfig()[3]}")
        return True

    except Exception as e:
        print(f"\n❌ WiFi connection error: {e}")
        return False


def connect_wifi_with_retry():
    """WiFi bağlantısını retry mekanizması ile başlat"""
    for attempt in range(WIFI_RETRY_ATTEMPTS):
        print(f"\n🔄 WiFi connection attempt {attempt + 1}/{WIFI_RETRY_ATTEMPTS}")

        if connect_wifi():
            # WiFi başarılı, NTP senkronizasyonu yap
            sync_time_with_ntp()
            return True

        if attempt < WIFI_RETRY_ATTEMPTS - 1:
            print(f"⏳ Retrying in {WIFI_RETRY_DELAY} seconds...")
            time.sleep(WIFI_RETRY_DELAY)

    print("❌ WiFi connection failed after all attempts")
    return False


def check_wifi_connection():
    """WiFi bağlantısını kontrol et ve gerekirse yeniden bağlan"""
    global wlan

    if wlan is None:
        return connect_wifi()

    if not wlan.isconnected():
        print("⚠️  WiFi connection lost! Attempting to reconnect...")
        return connect_wifi()

    return True


# WiFi bağlantısını başlat (retry ile)
if WIFI_SSID and WIFI_PASSWORD:
    connect_wifi_with_retry()
else:
    print("⚠️  WiFi not configured. Edit config.py to enable network features.")

print("=" * 50 + "\n")
