# ESP32 MicroPython Projesi - Kurulum Rehberi (MacBook M4)

## 📋 İçindekiler

1. [Gerekli Yazılımlar](#gerekli-yazılımlar)
2. [MicroPython Kurulumu](#micropython-kurulumu)
3. [VS Code Yapılandırması](#vs-code-yapılandırması)
4. [Proje Dosyaları](#proje-dosyaları)
5. [ESP32'ye Yükleme](#esp32ye-yükleme)
6. [Test ve Çalıştırma](#test-ve-çalıştırma)
7. [Sorun Giderme](#sorun-giderme)

---

## 🛠️ Gerekli Yazılımlar

### 1. Homebrew (Zaten yoksa)

Terminal'i açın ve çalıştırın:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Python 3 Kurulumu

```bash
brew install python3
python3 --version  # Kontrol
```

### 3. esptool Kurulumu

ESP32'ye firmware yüklemek için:

```bash
pip3 install esptool
```

### 4. ampy Kurulumu (Dosya transferi için)

```bash
pip3 install adafruit-ampy
```

### 5. Visual Studio Code

İndirin: https://code.visualstudio.com/

### 6. VS Code Eklentileri

VS Code'u açın ve şu eklentileri yükleyin:

- **Pylance** (Python dil desteği)
- **Python** (Microsoft tarafından)
- **MicroPico** (MicroPython desteği - önerilen)

---

## 📥 MicroPython Kurulumu

### Adım 1: MicroPython Firmware İndirme

```bash
# İndirme klasörü oluştur
mkdir -p ~/Downloads/ESP32-MicroPython
cd ~/Downloads/ESP32-MicroPython

# En güncel MicroPython firmware'ini indir
curl -O https://micropython.org/resources/firmware/ESP32_GENERIC-20240222-v1.22.2.bin
```

**Alternatif:** Tarayıcıdan manuel indirme:

- https://micropython.org/download/ESP32_GENERIC/
- En güncel `.bin` dosyasını indirin

### Adım 2: ESP32'yi Bağlama

1. ESP32'yi USB kablosuyla MacBook'a bağlayın
2. Port adını bulun:

```bash
ls /dev/cu.*
```

Çıktı şuna benzer olacak:

```
/dev/cu.usbserial-0001
/dev/cu.SLAB_USBtoUART
/dev/cu.wchusbserial140
```

ESP32'nizin port adını not alın (genellikle `cu.usbserial-` ile başlar).

### Adım 3: Flash'ı Temizleme

**ÖNEMLİ:** Port adınızı değiştirin!

```bash
# PORT_ADI'nı kendi portunuzla değiştirin
export ESP_PORT=/dev/cu.usbserial-0001

# Flash'ı temizle
esptool.py --chip esp32 --port $ESP_PORT erase_flash
```

**Beklenen çıktı:**

```
Chip is ESP32-D0WDQ6 (revision 1)
Erasing flash (this may take a while)...
Chip erase completed successfully
```

### Adım 4: MicroPython Yükleme

```bash
# MicroPython'ı yükle
esptool.py --chip esp32 --port $ESP_PORT --baud 460800 write_flash -z 0x1000 ESP32_GENERIC-20240222-v1.22.2.bin
```

**Beklenen çıktı:**

```
Writing at 0x00001000... (100 %)
Hash of data verified.
Leaving...
Hard resetting via RTS pin...
```

✅ **Tebrikler!** MicroPython yüklendi.

---

## 🖥️ VS Code Yapılandırması

### Adım 1: Proje Klasörü Oluşturma

```bash
mkdir -p ~/Documents/ESP32-Sensor-Project
cd ~/Documents/ESP32-Sensor-Project
```

### Adım 2: VS Code'da Açma

```bash
code .
```

### Adım 3: MicroPico Eklentisi Yapılandırması

1. VS Code'da **Cmd+Shift+P** basın
2. `MicroPico: Configure Project` yazın ve seçin
3. Port seçimi yapın (örn: `/dev/cu.usbserial-0001`)

**Alternatif:** `.vscode/settings.json` oluşturun:

```json
{
  "micropico.autoConnect": true,
  "micropico.syncFolder": "",
  "python.analysis.extraPaths": ["${workspaceFolder}"]
}
```

---

## 📁 Proje Dosyaları

### Dosya Yapısı

```
ESP32-Sensor-Project/
├── main.py           # Ana program
├── mlx90614.py       # MLX90614 kütüphanesi
├── bme280.py         # BME280 kütüphanesi
├── boot.py           # Boot yapılandırması (opsiyonel)
└── README.md         # Bu dosya
```

### 1. main.py

Ana program dosyası (artifact'teki kod).

### 2. mlx90614.py

MLX90614 sensör kütüphanesi (artifact'teki kod).

### 3. bme280.py

BME280 sensör kütüphanesi (artifact'teki kod).

### 4. boot.py (Opsiyonel)

ESP32 her açıldığında ilk çalışan dosya:

```python
# boot.py - ESP32 açılış yapılandırması
import esp
import gc

# Debug mesajlarını kapat
esp.osdebug(None)

# Garbage collector'ı çalıştır
gc.collect()

print("\n" + "="*50)
print("ESP32 Başlatıldı - MicroPython")
print("="*50)
```

---

## 📤 ESP32'ye Yükleme

### Yöntem 1: MicroPico ile (VS Code - Önerilen)

1. **Dosya oluştur:** VS Code'da `main.py` oluşturun
2. **Kodu yapıştır:** Artifact'teki kodu yapıştırın
3. **Yükle:**
   - Dosyayı sağ tıklayın
   - `Upload current file to Pico` seçin
4. Aynı işlemi `mlx90614.py` ve `bme280.py` için tekrarlayın

### Yöntem 2: ampy ile (Terminal)

```bash
# Port tanımla
export ESP_PORT=/dev/cu.usbserial-0001

# Dosyaları yükle
ampy --port $ESP_PORT put main.py
ampy --port $ESP_PORT put mlx90614.py
ampy --port $ESP_PORT put bme280.py
ampy --port $ESP_PORT put boot.py  # Opsiyonel

# Dosyaların yüklendiğini kontrol et
ampy --port $ESP_PORT ls
```

**Beklenen çıktı:**

```
/boot.py
/main.py
/mlx90614.py
/bme280.py
```

### Yöntem 3: screen ile (Manuel REPL)

```bash
# REPL'e bağlan
screen /dev/cu.usbserial-0001 115200

# Çıkmak için: Ctrl+A, sonra K, sonra Y
```

REPL'de dosyaları elle kopyalayabilirsiniz (pratik değil).

---

## ▶️ Test ve Çalıştırma

### Test Adımları

#### 1. REPL'e Bağlanma (Yöntem 1 - screen)

```bash
screen /dev/cu.usbserial-0001 115200
```

**ESP32'yi reset edin** (RST butonuna basın) veya:

```python
import machine
machine.reset()
```

#### 2. REPL'e Bağlanma (Yöntem 2 - MicroPico)

VS Code'da:

1. **Cmd+Shift+P**
2. `MicroPico: Connect` seçin
3. Terminal'de REPL görünecek

#### 3. I²C Cihazları Kontrol

```python
from machine import Pin, I2C

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
print(i2c.scan())
```

**Beklenen çıktı:**

```python
[90, 118]  # veya [0x5a, 0x76]
```

- `90` (0x5A) → MLX90614
- `118` (0x76) → BME280

❌ **Eğer `[]` görüyorsanız:** Bağlantıları kontrol edin!

#### 4. Ana Programı Çalıştırma

Manuel çalıştırma (REPL'de):

```python
import main
```

Veya ESP32'yi reset edin, `main.py` otomatik çalışacak.

### Beklenen Çıktı

```
🚀 ESP32 Çoklu Sensör Projesi
Başlatılıyor...

Sensörler başlatılıyor...
✓ DHT11 başlatıldı
✓ I2C bus başlatıldı
Bulunan I2C adresleri: ['0x5a', '0x76']
✓ MLX90614 başlatıldı
✓ BME280 başlatıldı

Okumalar başlıyor (Her 5 saniyede bir)...
Durdurmak için Ctrl+C basın

==================================================
SENSÖR OKUMALARI
==================================================

📊 DHT11:
  Sıcaklık: 24°C
  Nem: 55%

🌡️ MLX90614:
  Ortam Sıcaklığı: 24.50°C
  Nesne Sıcaklığı: 28.30°C

🌤️ BME280:
  Sıcaklık: 24.35°C
  Nem: 54.20%
  Basınç: 1013.25 hPa
==================================================
```

---

## 🔧 Sorun Giderme

### ❌ Problem: Port bulunamıyor

**Çözüm:**

```bash
# Sürücü yükleyin
brew install --cask silicon-labs-vcp-driver

# Bilgisayarı yeniden başlatın
sudo reboot
```

### ❌ Problem: Permission denied

**Çözüm:**

```bash
# Kullanıcı izinleri ekleyin (genelde gerekmiyor ama...)
sudo dseditgroup -o edit -a $(whoami) -t user wheel
```

### ❌ Problem: I²C cihazlar bulunamıyor

**Kontrol Listesi:**

- [ ] Pull-up dirençler takılı mı? (5kΩ, 3.3V - SDA/SCL arası)
- [ ] SDA → D21, SCL → D22 doğru mu?
- [ ] Her iki sensör de aynı I²C hattına bağlı mı?
- [ ] 3.3V ve GND bağlantıları doğru mu?
- [ ] Kablolarda kopukluk var mı?

**Test kodu:**

```python
from machine import Pin, I2C
import time

# Farklı frekansları dene
for freq in [100000, 400000, 50000]:
    print(f"\nFrekans: {freq} Hz")
    i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=freq)
    devices = i2c.scan()
    print(f"Bulunan cihazlar: {[hex(d) for d in devices]}")
    time.sleep(1)
```

### ❌ Problem: DHT11 okuma hatası

**Çözüm:**

```python
# DHT11 hassas bir sensör, gecikme ekleyin
import dht
from machine import Pin
import time

sensor = dht.DHT11(Pin(4))

for i in range(5):
    try:
        time.sleep(2)  # En az 2 saniye bekle
        sensor.measure()
        print(f"Sıcaklık: {sensor.temperature()}°C")
        print(f"Nem: {sensor.humidity()}%")
        break
    except Exception as e:
        print(f"Deneme {i+1}: {e}")
```

### ❌ Problem: BME280 Chip ID hatası

**Çözüm:**
BME280'iniz 0x77 adresinde olabilir:

`bme280.py` dosyasında değişiklik:

```python
# Satır 8'i değiştir:
BME280_I2C_ADDR = 0x77  # Eski değer: 0x76
```

Veya `main.py` içinde:

```python
self.bme = bme280.BME280(i2c=self.i2c, address=0x77)
```

### ❌ Problem: Import hatası

**Çözüm:**

```bash
# Dosyaların ESP32'de olduğunu kontrol et
ampy --port $ESP_PORT ls

# Eksik dosya varsa tekrar yükle
ampy --port $ESP_PORT put mlx90614.py
ampy --port $ESP_PORT put bme280.py
```

---

## 🚀 Hızlı Başlangıç Özeti

```bash
# 1. MicroPython firmware'ini indir ve yükle
esptool.py --chip esp32 --port /dev/cu.usbserial-0001 erase_flash
esptool.py --chip esp32 --port /dev/cu.usbserial-0001 write_flash -z 0x1000 ESP32_GENERIC-*.bin

# 2. Proje klasörü oluştur
mkdir ~/Documents/ESP32-Sensor-Project
cd ~/Documents/ESP32-Sensor-Project

# 3. Dosyaları oluştur (VS Code'da)
code .

# 4. Kodları artifacts'ten kopyala ve kaydet

# 5. ESP32'ye yükle
ampy --port /dev/cu.usbserial-0001 put main.py
ampy --port /dev/cu.usbserial-0001 put mlx90614.py
ampy --port /dev/cu.usbserial-0001 put bme280.py

# 6. Test et
screen /dev/cu.usbserial-0001 115200
# ESP32'yi reset et veya:
>>> import machine
>>> machine.reset()
```

---

## 📚 Faydalı Komutlar

```bash
# ESP32'ye bağlan (REPL)
screen /dev/cu.usbserial-0001 115200

# REPL'den çık
Ctrl+A, sonra K, sonra Y

# Dosya yükle
ampy --port /dev/cu.usbserial-0001 put dosya.py

# Dosya indir
ampy --port /dev/cu.usbserial-0001 get main.py

# Dosya sil
ampy --port /dev/cu.usbserial-0001 rm main.py

# Klasör listele
ampy --port /dev/cu.usbserial-0001 ls

# REPL'de kod çalıştır
ampy --port /dev/cu.usbserial-0001 run test.py
```

---

## 🎯 Sonraki Adımlar

1. **WiFi Ekleme:** Verileri buluta gönderme
2. **OLED Ekran:** Sensör verilerini görselleştirme
3. **Web Server:** ESP32'yi web arayüzü ile kontrol
4. **MQTT:** IoT platformlarına bağlanma
5. **Deep Sleep:** Pil ömrünü uzatma

---

## 📞 Destek

Sorun yaşıyorsanız:

1. Bu README'deki sorun giderme bölümünü kontrol edin
2. REPL'de hata mesajlarını okuyun
3. Bağlantıları ve sensör adreslerini doğrulayın

**Başarılar!** 🎉
