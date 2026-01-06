"""
ESP32 Çoklu Sensör Okuma Projesi
DHT11, MLX90614 ve BME280 sensörlerinden veri okuma
Backend'e HTTP POST ile veri gönderme
"""

import time

import bme280
import dht
import mlx90614
from machine import I2C, Pin

# Import configuration
try:
    from boot import check_wifi_connection
    from config import (
        API_ENDPOINT,
        API_SERVER_URL,
        BUFFER_MAX_SIZE,
        DEVICE_ID,
        RETRY_ATTEMPTS,
        RETRY_DELAY,
        SEND_INTERVAL,
    )
except ImportError:
    print("⚠️  config.py not found! Please create it from config.example.py")
    API_SERVER_URL = None
    API_ENDPOINT = None
    DEVICE_ID = "esp32-default"
    SEND_INTERVAL = 5
    RETRY_ATTEMPTS = 3
    RETRY_DELAY = 2
    BUFFER_MAX_SIZE = 50

    def check_wifi_connection():
        return False


# Import urequests for HTTP client
try:
    import urequests
except ImportError:
    print("⚠️  urequests not found! Install it with: upip.install('urequests')")
    urequests = None

# Pin tanımlamaları (30 pinli ESP32 DevKit için)
DHT_PIN = 4  # DHT11 → D4 pinine
I2C_SDA = 21  # BME280 ve MLX90614 SDA → D21
I2C_SCL = 22  # BME280 ve MLX90614 SCL → D22


class DataBuffer:
    """
    Circular buffer for offline data storage
    WiFi kesintisinde veri kaybını önlemek için RAM-based tamponlama
    """

    def __init__(self, max_size=50):
        self.buffer = []
        self.max_size = max_size
        self.index = 0

    def add(self, data):
        """Veri ekle (circular buffer mantığı)"""
        if len(self.buffer) < self.max_size:
            self.buffer.append(data)
        else:
            # Buffer dolu, en eski veriyi üzerine yaz (FIFO)
            self.buffer[self.index % self.max_size] = data
            self.index += 1

        print(f"📦 Buffer: {len(self.buffer)}/{self.max_size} items")

    def get_all(self):
        """Tüm veriyi al ve temizle (FIFO sırasıyla)"""
        data = self.buffer.copy()
        self.clear()
        return data

    def clear(self):
        """Buffer'ı temizle"""
        self.buffer.clear()
        self.index = 0

    def is_empty(self):
        """Buffer boş mu?"""
        return len(self.buffer) == 0

    def size(self):
        """Buffer'daki eleman sayısı"""
        return len(self.buffer)


# Global buffer instance
data_buffer = DataBuffer(max_size=BUFFER_MAX_SIZE)


class SensorReader:
    def __init__(self):
        """Sensörleri başlat"""
        print("Sensörler başlatılıyor...")

        # DHT11 başlat
        try:
            # Pull-up resistor aktif et (ETIMEDOUT hatasını önler)
            self.dht_sensor = dht.DHT11(Pin(DHT_PIN, Pin.IN, Pin.PULL_UP))
            print("✓ DHT11 başlatıldı (pull-up aktif)")
        except Exception as e:
            print(f"✗ DHT11 hatası: {e}")
            self.dht_sensor = None

        # I2C bus başlat
        try:
            self.i2c = I2C(0, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=100000)
            print("✓ I2C bus başlatıldı")

            # I2C cihazlarını tara
            devices = self.i2c.scan()
            print(f"Bulunan I2C adresleri: {[hex(d) for d in devices]}")

            # Debug: Her cihazı tanımla
            if devices:
                for addr in devices:
                    if addr == 0x5A:
                        print(f"  └─ 0x5A: MLX90614 (IR Sıcaklık)")
                    elif addr == 0x76:
                        print(f"  └─ 0x76: BME280/BMP280")
                    elif addr == 0x77:
                        print(f"  └─ 0x77: BME280/BMP280")
                    else:
                        print(f"  └─ {hex(addr)}: Bilinmeyen cihaz")
            else:
                print("⚠️  Hiç I2C cihaz bulunamadı - bağlantıları kontrol edin!")

        except Exception as e:
            print(f"✗ I2C hatası: {e}")
            self.i2c = None
            return

        # MLX90614 başlat (adres: 0x5A)
        try:
            self.mlx = mlx90614.MLX90614(self.i2c)
            print("✓ MLX90614 başlatıldı")
        except Exception as e:
            print(f"✗ MLX90614 hatası: {e}")
            self.mlx = None

        # BME280 başlat (adres: 0x76 veya 0x77)
        try:
            # Önce varsayılan adres 0x76'yı dene
            if 0x76 in devices:
                self.bme = bme280.BME280(i2c=self.i2c, address=0x76)
                print("✓ BME280 başlatıldı (adres: 0x76)")
            # Bulunamazsa 0x77'yi dene
            elif 0x77 in devices:
                self.bme = bme280.BME280(i2c=self.i2c, address=0x77)
                print("✓ BME280 başlatıldı (adres: 0x77)")
            else:
                raise RuntimeError("BME280 I2C adresinde bulunamadı (0x76 veya 0x77)")
        except Exception as e:
            print(f"✗ BME280 hatası: {e}")
            print(
                "   Kontrol edin: SDO pini GND'ye mi bağlı (0x76) yoksa VCC'ye mi (0x77)?"
            )
            self.bme = None

    def read_dht11(self):
        """DHT11'den sıcaklık ve nem oku"""
        if not self.dht_sensor:
            return None, None

        try:
            # DHT11, iki okuma arası minimum 2 saniye beklemeli
            time.sleep(2)
            self.dht_sensor.measure()
            temp = self.dht_sensor.temperature()
            hum = self.dht_sensor.humidity()
            return temp, hum
        except OSError as e:
            if "ETIMEDOUT" in str(e):
                print(f"DHT11 okuma hatası: {e}")
                print("  ⚠️  Pull-up resistor (4.7kΩ) GPIO4 ile 3.3V arası eklenmelidir")
            else:
                print(f"DHT11 okuma hatası: {e}")
            return None, None
        except Exception as e:
            print(f"DHT11 okuma hatası: {e}")
            return None, None

    def read_mlx90614(self):
        """MLX90614'den sıcaklık oku"""
        if not self.mlx:
            return None, None

        try:
            ambient = self.mlx.read_ambient_temp()
            object_temp = self.mlx.read_object_temp()
            return ambient, object_temp
        except Exception as e:
            print(f"MLX90614 okuma hatası: {e}")
            return None, None

    def read_bme280(self):
        """BME280'den sıcaklık, nem ve basınç oku"""
        if not self.bme:
            return None, None, None

        try:
            values = self.bme.values
            # values tuple formatı: (temp, pressure, humidity)
            temp = float(values[0].replace("C", ""))
            pressure = float(values[1].replace("hPa", ""))
            humidity = float(values[2].replace("%", ""))
            return temp, humidity, pressure
        except Exception as e:
            print(f"BME280 okuma hatası: {e}")
            return None, None, None

    def read_all(self):
        """Tüm sensörlerden veri oku"""
        print("\n" + "=" * 50)
        print("SENSÖR OKUMALARI")
        print("=" * 50)

        # DHT11
        dht_temp, dht_hum = self.read_dht11()
        if dht_temp is not None:
            print(f"\n📊 DHT11:")
            print(f"  Sıcaklık: {dht_temp}°C")
            print(f"  Nem: {dht_hum}%")
        else:
            print("\n📊 DHT11: Veri okunamadı")

        # MLX90614
        mlx_ambient, mlx_object = self.read_mlx90614()
        if mlx_ambient is not None:
            print(f"\n🌡️ MLX90614:")
            print(f"  Ortam Sıcaklığı: {mlx_ambient:.2f}°C")
            print(f"  Nesne Sıcaklığı: {mlx_object:.2f}°C")
        else:
            print("\n🌡️ MLX90614: Veri okunamadı")

        # BME280
        bme_temp, bme_hum, bme_press = self.read_bme280()
        if bme_temp is not None:
            print(f"\n🌤️ BME280:")
            print(f"  Sıcaklık: {bme_temp:.2f}°C")
            print(f"  Nem: {bme_hum:.2f}%")
            print(f"  Basınç: {bme_press:.2f} hPa")
        else:
            print("\n🌤️ BME280: Veri okunamadı")

        print("=" * 50)

        return {
            "dht11": {"temp": dht_temp, "humidity": dht_hum},
            "mlx90614": {"ambient": mlx_ambient, "object": mlx_object},
            "bme280": {"temp": bme_temp, "humidity": bme_hum, "pressure": bme_press},
        }

    def get_formatted_data(self):
        """Sensör verilerini backend formatına çevir"""
        raw_data = self.read_all()

        # BME280 ve MLX90614 verilerini kullan (öncelikli)
        # Fallback olarak DHT11 kullan
        temperature = None
        humidity = None
        body_temperature = None

        # Sıcaklık: BME280 > DHT11
        if raw_data["bme280"]["temp"] is not None:
            temperature = raw_data["bme280"]["temp"]
        elif raw_data["dht11"]["temp"] is not None:
            temperature = float(raw_data["dht11"]["temp"])

        # Nem: DHT11 > BME280 (DHT11 öncelikli)
        if raw_data["dht11"]["humidity"] is not None:
            humidity = float(raw_data["dht11"]["humidity"])
        elif raw_data["bme280"]["humidity"] is not None:
            humidity = raw_data["bme280"]["humidity"]

        # Vücut sıcaklığı: MLX90614 object temperature
        if raw_data["mlx90614"]["object"] is not None:
            body_temperature = raw_data["mlx90614"]["object"]

        # Tüm değerler None ise None dön
        if temperature is None and humidity is None and body_temperature is None:
            return None

        return {
            "temperature": temperature,
            "humidity": humidity,
            "bodyTemperature": body_temperature,
            "deviceId": DEVICE_ID,
            "timestamp": self.get_iso_timestamp(),
        }

    @staticmethod
    def get_iso_timestamp():
        """ISO 8601 formatında timestamp oluştur"""
        # MicroPython'da gerçek tarih/saat için RTC gerekli
        # Şimdilik basit bir timestamp kullan
        import time

        # Unix timestamp'ı ISO formatına çevir (yaklaşık)
        # Not: ESP32'de RTC ayarlanmazsa bu değer 2000'den başlar
        t = time.localtime()
        return "{:04d}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}Z".format(
            t[0], t[1], t[2], t[3], t[4], t[5]
        )


def send_to_backend(data):
    """
    Tek bir veri paketini backend'e gönder
    Buffer mekanizması tarafından kullanılır
    """
    if not urequests:
        return False

    if not API_SERVER_URL or not API_ENDPOINT:
        return False

    url = API_SERVER_URL + API_ENDPOINT
    headers = {"Content-Type": "application/json"}
    response = None

    try:
        response = urequests.post(url, json=data, headers=headers, timeout=10)

        if response.status_code == 201:
            print("✅ Data sent successfully")
            return True
        else:
            print(f"❌ Server error: {response.status_code}")
            return False

    except OSError as e:
        print(f"❌ Network error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if response:
            try:
                response.close()
            except:
                pass


def send_sensor_data_with_buffer(data):
    """
    Buffer destekli veri gönderme
    WiFi yoksa buffer'a ekler, WiFi varsa önce buffer'daki eski verileri gönderir
    """
    # WiFi yoksa buffer'a ekle
    if not check_wifi_connection():
        print("⚠️  No WiFi connection, buffering data...")
        data_buffer.add(data)
        return False

    # WiFi var, önce buffer'daki eski verileri gönder
    if not data_buffer.is_empty():
        print(f"📤 Sending {data_buffer.size()} buffered items...")
        buffered_data = data_buffer.get_all()

        for idx, item in enumerate(buffered_data):
            print(f"  [{idx + 1}/{len(buffered_data)}] Sending buffered data...")
            success = send_to_backend(item)

            if not success:
                # Gönderilemedi, geri buffer'a ekle
                print("  ⚠️  Failed to send buffered data, re-adding to buffer")
                data_buffer.add(item)
                # Kalan verileri de geri ekle
                for remaining_item in buffered_data[idx + 1 :]:
                    data_buffer.add(remaining_item)
                break

            time.sleep(0.5)  # Rate limiting

    # Şimdi yeni veriyi gönder
    print(f"\n📤 Sending current data to {API_SERVER_URL + API_ENDPOINT}")
    print(f"   Data: {data}")
    success = send_to_backend(data)

    if not success:
        print("  ⚠️  Failed to send current data, adding to buffer")
        data_buffer.add(data)

    return success


def send_sensor_data(data):
    """
    DEPRECATED: Eski fonksiyon, geriye dönük uyumluluk için bırakıldı
    Artık send_sensor_data_with_buffer() kullanılmalı
    """
    return send_sensor_data_with_buffer(data)


# Ana program
def main():
    print("\n🚀 ESP32 Çoklu Sensör Projesi")
    print("Başlatılıyor...\n")

    # WiFi durumunu kontrol et
    if check_wifi_connection():
        print("✅ WiFi connected, data will be sent to backend")
        print(f"   Server: {API_SERVER_URL}")
    else:
        print("⚠️  WiFi not connected, running in offline mode")

    # Sensör okuyucuyu başlat
    reader = SensorReader()

    print(f"\nOkumalar başlıyor (Her {SEND_INTERVAL} saniyede bir)...")
    print("Durdurmak için Ctrl+C basın\n")

    try:
        while True:
            # Sensör verilerini oku ve formatla
            data = reader.get_formatted_data()

            if data:
                # Buffer destekli gönderim
                send_sensor_data_with_buffer(data)
            else:
                print("⚠️  No valid sensor data to send")

            time.sleep(SEND_INTERVAL)

    except KeyboardInterrupt:
        print("\n\n⚠️  Program durduruldu.")
        # Buffer'daki verileri kaydetme girişimi
        if not data_buffer.is_empty():
            print(
                f"📦 {data_buffer.size()} items in buffer (will be lost on power off)"
            )
    except Exception as e:
        print(f"\n\n❌ Critical error: {e}")
        import sys

        sys.print_exception(e)
        print("\n⏳ Restarting in 10 seconds...")
        time.sleep(10)
        import machine

        machine.reset()


if __name__ == "__main__":
    main()
