# Bebek Beşiği Otomasyon Sistemi

Bu proje, ESP32 tabanlı bir gömülü cihaz ile ortam sıcaklığı, nem ve temassız (IR/laser işaretli) vücut sıcaklığı ölçümleri toplayıp, bu verileri bir Node.js arka ucuna göndererek React tabanlı bir web arayüzünde gösteren bir bebek beşiği otomasyon sistemini tanımlar.

Özellikler

- Ortam sıcaklığı ve nem ölçümü (BME280 veya DHT11 ile yedekleme)
- Temassız vücut sıcaklığı ölçümü (MLX90614 IR sensör)
- ESP32 (MicroPython) üzerinden Wi-Fi ile veri gönderme ve offline veri tamponlama
- Node.js/TypeScript arka uç (REST API + Socket.io) — verileri MongoDB'de saklar ve gerçek zamanlı yayınlar
- React (Vite + TypeScript) ön uç — gerçek zamanlı izleme, grafik gösterimi ve dinamik uyarı eşikleri

Bu README şu bölümleri içerir:

- Sistem mimarisi
- Donanım bileşenleri ve örnek bağlantılar
- ESP32 firmware sözleşmesi (veri formatı, uç nokta)
- Backend ve frontend kurulum & çalıştırma adımları
- Güvenlik, test ve sorun giderme notları

## Sistem Mimarisi (kısa)

1. ESP32 cihazı bağlı sensörlerden (BME280, DHT11, MLX90614) ölçüm alır.
2. Ölçümler her 5 saniyede bir arka uca (REST API) POST edilir. WiFi kesintisinde en fazla 50 veri noktası RAM'de tamponlanır.
3. Arka uç veriyi MongoDB'ye kaydeder (30 gün TTL) ve Socket.io ile tüm bağlı istemcilere gerçek zamanlı broadcast eder.
4. React tabanlı ön uç Socket.io ile gerçek zamanlı verileri alır, grafik gösterir ve dinamik eşik değerlerine göre uyarı gösterir.

## Donanım Bileşenleri (örnek)

- **ESP32 DevKit** (30-pin versiyonu önerilir) - Dual-core 240 MHz, 520 KB RAM, WiFi/Bluetooth
- **Ortam sensörü:** BME280 (I2C) - sıcaklık, nem ve basınç ölçümü (öncelikli)
- **Yedek ortam sensörü:** DHT11 (Digital) - BME280 yoksa devreye girer
- **Temassız vücut sıcaklığı:** MLX90614 (I2C) - IR temassız termometre
- **Güç kaynağı:** 5V USB adaptör veya 3.7V LiPo batarya (gerilim regülatörü ile)
- **İhtiyaç halinde:** breadboard, jumper kablolar, 4.7kΩ pull-up dirençleri (DHT11 için)

Not: ESP32'nin dual-core mimarisi ve 520 KB RAM'i, ESP8266'ya (80 KB RAM) göre çok daha stabil çalışma sağlar.

### Örnek Bağlantılar (ESP32 DevKit 30-pin)

- **DHT11:** Data pin → GPIO4 (D4), VCC → 3.3V, GND → GND (4.7kΩ pull-up önerilir)
- **BME280 (I2C):** SDA → GPIO21, SCL → GPIO22, VCC → 3.3V, GND → GND
- **MLX90614 (I2C):** SDA → GPIO21, SCL → GPIO22, VCC → 3.3V, GND → GND

**Not:** BME280 ve MLX90614 aynı I2C bus'ı paylaşır (GPIO21/22). Her ikisi de farklı I2C adreslerine sahip olduğu için sorunsuz çalışır.

## ESP32 Firmware / Yazılım Sözleşmesi

ESP32 cihazı MicroPython ile çalışır ve arka uca JSON formatında ölçümleri POST eder.

**Önemli özellikler:**

- NTP ile otomatik saat senkronizasyonu (boot'ta)
- WiFi kesintisinde 50 verilik circular buffer (RAM-based)
- Sensör okuma önceliği: BME280 > DHT11
- Her 5 saniyede bir veri gönderimi
- Otomatik yeniden bağlanma ve retry mekanizması

### Veri Formatı

Örnek payload:

{
"deviceId": "node-01",
"temperature": 24.6, // ortam sıcaklığı (°C)
"humidity": 45.2, // bağıl nem (%)
"bodyTemperature": 36.4, // temassız ölçülen vücut sıcaklığı (°C)
"timestamp": "2025-11-08T12:34:56Z"
}

**Uygulanan özellikler:**

- ✅ Circular buffer mekanizması: WiFi yoksa 50 veri noktası RAM'de saklanır, bağlantı gelince FIFO sırasıyla gönderilir.
- ✅ NTP senkronizasyonu: boot.py'de otomatik olarak gerçek zaman alınır.
- ⚠️ TLS/HTTPS: ESP32 destekler ancak şu anda HTTP kullanılıyor (akademik proje için yeterli).
- ⚠️ API Authentication: Şu anda yok. Production için API key veya JWT token mekanizması eklenmelidir.

## Backend (Node.js) — Kurulum & Çalıştırma

Bu depo içinde arka uç `web-interface/backend` dizininde yer alıyor.

Ön koşullar

- Node.js (Production'da LTS önerilir)
- npm

Kurulum (örnek):

1. Terminalde arka uç dizinine gidin:

```bash
cd web-interface/backend
```

2. Bağımlılıkları kurun:

```bash
npm install
```

3. Çalıştırma (geliştirme):

```bash
npm run build
# veya
node dist/server.js  #gelecekte docker teknolojisi ile geliştirilecektir.
```

Varsayılan API uç noktaları (Gelecekte değiştirilecektir.)

- POST /api/sensors - ESP cihazları veriyi gönderir
- GET /api/sensors/latest - son değerleri al
- GET /api/sensors/history?deviceId=node-01&limit=100 - geçmiş veriler

Not: Gerçek dosya yolu ve scriptler proje yapılandırmanıza bağlıdır; `web-interface/backend/package.json` içindeki script'leri kontrol edin.

## Frontend (React) — Kurulum & Çalıştırma

Ön koşullar

- Node.js, npm

Kurulum (örnek):

```bash
cd web-interface/frontend/web-interface
npm install
```

Çalıştırma (geliştirme):

```bash
npm run dev
```

build almak için

```bash
npm run build
```

Uygulama arayüzü gerçek zamanlı verileri gösterecek şekilde polling ile backend'e bağlanmalıdır. Mevcut dizin yapısı zaten bir React uygulaması içeriyor (Vite/CRA). `package.json` dosyasındaki scriptleri kullanın.

## Geliştirme ve Test Senaryoları

- ESP cihaz simulasyonu: Basit bir Node.js scripti ile POST istekleri gönderip arka ucunuzu test edebilirsiniz.
- Unit testleri: Backend için Jest veya Mocha; frontend için React Testing Library.
- En az testler: arka uç /api/sensors (happy path) ve hata durumları (geçersiz payload, yetkisiz erişim).

## API Sözleşmesi (Kısa)

Girdi (cihazdan backend'e): JSON (örnek yukarıda)
Çıktı (backend -> ön uç): JSON, tipik yapı:

{
"deviceId": "node-01",
"temperature": 24.6,
"humidity": 45.2,
"bodyTemperature": 36.4,
"timestamp": "2025-11-08T12:34:56Z"
}

Hata durumları: 400 (geçersiz veri), 401 (yetkisiz), 500 (sunucu hatası), 403 (yetkisi erişim), 200(başarılı sonuç), 404 (bulunamadı)

## Güvenlik ve Gizlilik

- Sensör verileri kişisel sağlık verisi sınıfına giriyorsa (özellikle vücut sıcaklığı), verileri korumaya önem verin.
- Üretim ortamında HTTPS / TLS kullanın. Eğer ESP cihazı doğrudan TLS ile güvenli bağlanamıyorsa, ağın arkasında güvenli bir köprü (ör. TLS terminator) kullanın.
- Cihazların kimlik doğrulaması için API anahtarı veya HMAC tabanlı kısa süreli token'lar kullanın.

## Sorun Giderme

- Cihaz bağlanmıyor: Wi‑Fi bilgilerini ve SSID/şifre doğruluğunu kontrol edin.
- Sensör hataları/okumuyor: Kablolar, güç beslemesi, pull-up dirençleri ve pin atamalarını doğrulayın.
- Zaman damgası sorunları: ESP'nin gerçek zaman saati yoksa backend zaman damgası kullanın veya NTP ile saat senkronizasyonu yapın.

## Gelecek İyileştirmeleri (Öneriler)

- TLS destekli bağlantı
- MQTT broker entegrasyonu (hafif ve gerçek zamanlı)
- İleri düzey alarm/kurallar motoru (örn. vücut sıcaklığı eşiklerine göre uyarı)
- Veritabanı entegrasyonu (Timeseries DB gibi InfluxDB) ile grafiksel geçmiş analizi

## Katkıda Bulunma

1. Fork -> branch oluştur -> değişiklik yap -> pull request
2. Kod tarzı: proje ESLint/Prettier kuralları varsa bunlara uyun

## Lisans

Bu depo kökünde bulunan `LICENSE` dosyasına bakınız.

```

```
