# Baby Crib Automation System - Kurulum ve Çalıştırma Talimatları

## 📋 Genel Bakış

Bu proje, ESP32 mikrodenetleyicisi ile sensör verilerini toplayıp MongoDB veritabanına kaydeden ve React frontend'de gerçek zamanlı görüntüleyen bir bebek beşik otomasyon sistemidir.

## 🏗️ Mimari

- **ESP32 Firmware**: MicroPython ile sensör okuma ve WiFi üzerinden veri gönderme
- **Backend API**: Node.js + Express + Socket.io + MongoDB
- **Frontend**: React + Vite + TypeScript + TailwindCSS + Socket.io-client

## 📦 Gereksinimler

### Backend

- Node.js v22+
- MongoDB (local veya Atlas)
- npm veya yarn

### ESP32

- MicroPython yüklü ESP32
- Sensörler: BME280, DHT11, MLX90614
- WiFi bağlantısı

### Frontend

- Node.js v18+
- Modern web browser

## 🚀 Kurulum

### 1. Backend Kurulumu

```bash
cd services/api-server

# Dependencies yükle
npm install

# .env dosyasını oluştur (.env.example'dan kopyala)
cp .env.example .env

# .env dosyasını düzenle
# MONGODB_URI=mongodb://localhost:27017/baby-crib-db
# PORT=3000
# CORS_ORIGIN=http://localhost:5173

# MongoDB'nin çalıştığından emin ol (local kullanıyorsanız)
# macOS/Linux:
# brew services start mongodb-community
# mongod --version

# Development modda başlat
npm run dev

# Veya production build
npm run build
npm start
```

### 2. Frontend Kurulumu

```bash
cd web-interface

# Dependencies yükle
npm install

# .env dosyasını oluştur
echo "VITE_API_URL=http://localhost:3000" > .env

# Development server'ı başlat
npm run dev

# Tarayıcıda aç: http://localhost:5173
```

### 3. ESP32 Kurulumu

```bash
cd esp32-firmware

# config.py dosyasını oluştur (config.example.py'dan)
cp config.example.py config.py

# config.py dosyasını düzenle:
# - WIFI_SSID: WiFi ağ adınız
# - WIFI_PASSWORD: WiFi şifreniz
# - API_SERVER_URL: Backend sunucunuzun IP adresi (örn: http://192.168.1.100:3000)

# ESP32'ye dosyaları yükle (ampy, rshell veya Thonny kullanarak)
# Örnek: ampy kullanarak
ampy --port /dev/ttyUSB0 put boot.py
ampy --port /dev/ttyUSB0 put main.py
ampy --port /dev/ttyUSB0 put config.py
ampy --port /dev/ttyUSB0 put bme280.py
ampy --port /dev/ttyUSB0 put mlx90614.py

# ESP32'yi reset edin veya yeniden başlatın
```

## 🔧 Yapılandırma

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/baby-crib-db
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

### ESP32 (config.py)

```python
WIFI_SSID = "your-wifi-name"
WIFI_PASSWORD = "your-wifi-password"
API_SERVER_URL = "http://192.168.1.100:3000"
DEVICE_ID = "esp32-beşik-01"
SEND_INTERVAL = 5  # saniye
```

## 📡 API Endpoint'leri

### REST API

- `GET /health` - Server sağlık kontrolü
- `POST /api/sensors` - ESP32'den sensör verisi al
- `GET /api/sensors/latest` - En son sensör verisi
- `GET /api/sensors/history?hours=1&limit=100` - Geçmiş veriler

### WebSocket Events

- `connect` - Client bağlandı
- `disconnect` - Client bağlantıyı kesti
- `sensorData` - Yeni sensör verisi (server → client)
- `requestLatestData` - Son veriyi iste (client → server)

## 📊 Veri Formatı

```typescript
{
  "id": "unique-id",
  "deviceId": "esp32-beşik-01",
  "timestamp": "2026-01-06T12:34:56Z",
  "temperature": 23.5,        // °C (BME280)
  "humidity": 55.2,           // % (BME280)
  "bodyTemperature": 36.8,    // °C (MLX90614)
  "alerts": [                 // Optional
    {
      "type": "temperature_high",
      "value": 27.5,
      "threshold": { "min": 20, "max": 26 }
    }
  ]
}
```

## 🔒 Güvenlik

- `config.py` dosyası `.gitignore` ile korunmaktadır
- WiFi credentials commit edilmemelidir
- Production'da HTTPS kullanın
- MongoDB'yi güvenli yapılandırın

## 🐛 Sorun Giderme

### Backend bağlantı hatası

```bash
# MongoDB çalışıyor mu?
mongosh

# Port 3000 boş mu?
lsof -i :3000

# Backend logları kontrol et
npm run dev
```

### ESP32 WiFi bağlanamıyor

```python
# Serial monitor'dan kontrol edin
# WiFi credentials doğru mu?
# Router 2.4GHz destekliyor mu?
# API_SERVER_URL doğru IP adresi mi?
```

### Frontend WebSocket bağlanamıyor

```bash
# Backend çalışıyor mu?
curl http://localhost:3000/health

# CORS ayarları doğru mu?
# .env dosyası VITE_API_URL doğru mu?
```

## 📝 Geliştirme Notları

- ESP32'de `urequests` kütüphanesi gereklidir: `upip.install('urequests')`
- MongoDB 30 gün sonra otomatik veri silme aktif (TTL index)
- Frontend 5 saniyede bir polling yerine Socket.io ile real-time veri alır
- Threshold değerleri backend'de tanımlıdır, ileride veritabanına taşınabilir

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce bir issue açın.
