# Web Arayüzü — Bebek Beşiği Otomasyon Sistemi

Bu klasör React tabanlı frontend uygulamasını içerir. Uygulama, NodeMCU (ESP8266) cihazlarından ve backend API'den gelen sensör verilerini gerçek zamanlı veya zaman aralıklı olarak görüntülemek, geçmiş veriye bakmak ve uyarılar/threshold kuralları oluşturmak için tasarlanmıştır.

Bu README aşağıdaki bölümleri kapsar:

- Proje özeti
- Ön koşullar
- Kurulum ve çalışma adımları
- Çevresel değişkenler (API URL vb.)
- Proje yapısı ve önemli bileşenler
- Test, lint ve build
- Geliştirme notları ve öneriler

## Proje Özeti

Frontend, modern React + Vite/CRA altyapısı ile geliştirilmiştir (proje kökündeki `package.json` ve yapılandırma dosyalarını kontrol edin). Amaç: canlı sensör verilerini kullanıcıya güvenli, okunabilir ve mobil uyumlu bir arayüzle sunmak.

Ana özellikler (önerilen):

- Gerçek zamanlı gösterge paneli (sıcaklık, nem, bebek vücut sıcaklığı)
- Geçmiş veri grafikleri (kısa dönem)
- Uyarılar / eşik tanımları
- Cihaz listesi ve son durum

## Ön Koşullar

- Node.js (Production için LTS önerilir)
- npm
- Backend çalışıyorsa (örn. `web-interface/backend`) veya backend için test API URL'si

## Kurulum

Terminalde frontend dizinine gidin:

```bash
cd web-interface/frontend/web-interface
```

Bağımlılıkları yükleyin:

```bash
npm install
```

Yerel geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Tarayıcıda Vite kullanılıyorsa `http://localhost:5173` açın (terminaldeki çıktıyı kontrol edin).

## Çevresel Değişkenler

Frontend uygulamasının backend API ile iletişim kurması için bir temel URL ayarlanması gerekir. Projede Vite veya CRA kullanımı farklı yöntemler gerektirebilir; yaygın örnekler:

- Vite: `.env` veya `.env.development` dosyasına
  (backend portuna göre port değeri değişebilir)
  VITE_API_BASE_URL=http://localhost:3000/api

- CRA: `.env` veya `.env.development` dosyasına
  REACT_APP_API_BASE_URL=http://localhost:4000/api

Frontend kodunda bu değişkenleri kullanarak API çağrılarını yapın. Örnek: `fetch(`${import.meta.env.VITE_API_BASE_URL}/sensors/latest`)` (Vite) veya `process.env.REACT_APP_API_BASE_URL` (CRA).

## Çalışma Modelleri (Gerçek Zamanlı Veri)

- Polling: Belirli aralıklarla (örn. 5s) backend'den `GET /sensors/latest` isteği atın.
- WebSocket/Socket.IO: Backend destekliyorsa, Socket üzerinden server'dan gelen push verilerini dinleyin.
- Server-Sent Events (SSE): Basit tek yönlü gerçek zamanlı güncellemeler için uygundur.

Kısa not: Eğer backend'de CORS veya auth varsa, frontend'in bu gereksinimlere göre yapılandırıldığından emin olun.

## Önerilen Proje Yapısı

- src/
  - components/ # Tekrarlanabilir bileşenler (Card, Gauge, Chart, DeviceList)
  - pages/ # Dashboard, History, Settings
  - services/ # API çağrıları
  - hooks/ # Özel React hook'ları (usePolling, useWebSocket)
  - utils/ # Yardımcı fonksiyonlar (formatting, thresholds)
  - assets/ # Görseller, ikonlar
  - App.tsx / main.tsx

## Önemli Bileşenler (özet)

- Dashboard: Anlık değerleri gösterecek (sıcaklık, nem, vücut sıcaklığı). Basit gauge veya kartlar kullanın.
- History: Grafikte zaman serisi gösterimi (Chart.js, Recharts veya ApexCharts kullanılbilir).
- DeviceList: Kayıtlı cihazların durumu, son güncelleme zamanı.
- Settings: Alt ve üst eşik değerleri ve uyarı tercihleri.

## Test, Lint ve Build

Projede test ve lint scriptleri varsa `package.json` içinde bulunur. Yaygın komutlar:

```bash
npm run lint
npm run test
npm run build
```

`build` komutu üretim için optimize edilmiş statik dosyalar oluşturur (ör. `dist/` veya `build/`).

## Geliştirme Notları ve İpuçları

- API hatalarını düzgün yakalayın ve kullanıcıya anlamlı geri bildirim verin.
- Mobil görünümü unutmayın; bebek izleme uygulamaları genellikle telefonda görüntülenir.
- Hassas sağlık verisi (vücut sıcaklığı) olduğu için frontend'de verilerin gösterilmesinde gizlilik/kullanıcı onayı konularını göz önünde bulundurun.
- Geliştirme sırasında CORS sorunlarıyla karşılaşırsanız backend'e geliştirme ortamında `Access-Control-Allow-Origin` ekleyin veya yerel bir proxy kullanın. Production tarafında cloudflare altyapısı kullanılabilir.

## E2E / Hızlı Simülasyon

Backend yokken frontend'i test etmek için `services` içinde küçük bir mock provider oluşturun veya `msw` (Mock Service Worker) kullanarak API cevaplarını taklit edin. Bu, UI geliştirmeyi backend'e bağlı olmadan hızlandırır.

## Katkıda Bulunma

1. Fork -> branch oluştur -> değişiklik yap -> pull request
2. Kod tarzı: proje kökünde ESLint/Prettier varsa onlara uyun

## Sonraki Adımlar (isteğe bağlı)

- Örnek bir `Dashboard` bileşeni ve `usePolling` hook'u hazırlamamı isterseniz, hazır bir örnek oluşturabilirim.
- Backend ile entegrasyon örneği (WebSocket veya polling) isterseniz, hangi yöntemi tercih ettiğinizi söyleyin.
