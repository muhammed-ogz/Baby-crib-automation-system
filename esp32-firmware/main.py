"""
ESP32 Çoklu Sensör Okuma Projesi
DHT11, MLX90614 ve BME280 sensörlerinden veri okuma
"""

import time

import bme280
import dht
import mlx90614
from machine import I2C, Pin

# Pin tanımlamaları (30 pinli ESP32 DevKit için)
DHT_PIN = 4  # DHT11 → D4 pinine
I2C_SDA = 21  # BME280 ve MLX90614 SDA → D21
I2C_SCL = 22  # BME280 ve MLX90614 SCL → D22


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


# Ana program
def main():
    print("\n🚀 ESP32 Çoklu Sensör Projesi")
    print("Başlatılıyor...\n")

    # Sensör okuyucuyu başlat
    reader = SensorReader()

    print("\nOkumalar başlıyor (Her 5 saniyede bir)...")
    print("Durdurmak için Ctrl+C basın\n")

    try:
        while True:
            reader.read_all()
            time.sleep(5)

    except KeyboardInterrupt:
        print("\n\nProgram durduruldu.")


if __name__ == "__main__":
    main()
