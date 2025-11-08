# Bebek Beşiği Otomasyon Sistemi

Bu proje, NodeMCU (ESP8266) tabanlı bir gömülü cihaz ile ortam sıcaklığı, nem ve temassız (IR/laser işaretli) vücut sıcaklığı ölçümleri toplayıp, bu verileri bir Node.js arka ucuna göndererek React tabanlı bir web arayüzünde gösteren bir bebek beşiği otomasyon sistemini tanımlar.

Özellikler

- Ortam sıcaklığı ve nem ölçümü (ör. DHT11/DHT22)
- Temassız vücut sıcaklığı ölçümü (ör. MLX90614 veya benzeri IR sensör; bazı modeller lazer işaretleyici ile gelir)
- NodeMCU (ESP8266) üzerinden Wi-Fi ile veri gönderme
- Node.js/TypeScript arka uç (REST API) — verileri alır ve web arayüzüne sunar
- React (Vite/CRA) ön uç — gerçek zamanlı izleme, veri geçmişi ve uyarılar

Bu README şu bölümleri içerir:

- Sistem mimarisi
- Donanım bileşenleri ve örnek bağlantılar
- ESP8266/NodeMCU için firmware sözleşmesi (veri formatı, uç nokta)
- Backend ve frontend kurulum & çalıştırma adımları
- Güvenlik, test ve sorun giderme notları

## Sistem Mimarisi (kısa)

1. NodeMCU (ESP8266) cihazı bağlı sensörlerden (örn. DHT22, MLX90614) ölçüm alır.
2. Ölçümler belli aralıklarla arka uca (REST API) POST edilir.
3. Arka uç veriyi alıp gerektiğinde depolar (örneğin kısa süreli bellek, dosya veya veritabanı) ve ön uca WebSocket/SSE veya düzenli HTTP ile sağlar.
4. React tabanlı ön uç gerçek zamanlı verileri gösterir, geçmişe bakma ve alarm/uyarı mekanizmaları sunar.

## Donanım Bileşenleri (örnek)

- NodeMCU ESP8266 (özgün: ESP-12E modülü)
- Ortam sıcaklık ve nem sensörü: DHT11 veya DHT22 (DHT22 daha hassas)
- Temassız vücut sıcaklığı: MLX90614 (I2C) veya başka bir IR temassız termometre (bazı cihazlarda lazer işaretleyici bulunur)
- Güç kaynağı: 5V USB adaptör (veya uygun regülatör)
- İhtiyaç halinde: breadboard, bağlantı kabloları, gerilim regülatörü, pull-up dirençleri

Not: Kablolama ve pin atamaları için kullandığınız NodeMCU versiyonunun pin haritasını kontrol edin.

### Örnek Bağlantılar (öneri)

- DHTxx veri pini -> örnek: D4 (GPIO2) (DHT'ye 4.7k pull-up gerekir)
- MLX90614 -> I2C: SDA -> D2 (GPIO4), SCL -> D1 (GPIO5) (NodeMCU pin isimleri kart etiketlerine göre farklılık gösterebilir)

Bu bağlantılar yalnızca örnektir; kartınızın pin çizelgesini doğrulayın.

## ESP8266 Firmware / Yazılım Sözleşmesi

ESP cihazı arka uca JSON formatında ölçümleri POST edecektir. Örnek payload:

{
"deviceId": "node-01",
"temperature": 24.6, // ortam sıcaklığı (°C)
"humidity": 45.2, // bağıl nem (%)
"bodyTemperature": 36.4, // temassız ölçülen vücut sıcaklığı (°C)
"timestamp": "2025-11-08T12:34:56Z"
}

Öneriler

- Cihaz, Wi-Fi bağlantısı koptuğunda veriyi yerelde tamponlayıp (ör. küçük döngüsel bellek) bağlantı sağlanınca gönderme yapmalı.
- Güvenlik: Mümkünse TLS kullanın (ESP8266 için fazladan maliyet/karmaşıklık olabilir). Alternatif: cihaz tarafında bir API anahtarı/tokenu gönderin ve arka uçta doğrulayın.

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
