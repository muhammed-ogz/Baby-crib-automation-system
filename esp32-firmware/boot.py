# boot.py - ESP32 açılış yapılandırması
import gc

import esp

# Debug mesajlarını kapat
esp.osdebug(None)

# Garbage collector'ı çalıştır
gc.collect()

print("\n" + "=" * 50)
print("ESP32 Başlatıldı - MicroPython")
print("=" * 50)
