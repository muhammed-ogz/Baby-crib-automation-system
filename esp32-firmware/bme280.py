"""
BME280 Sıcaklık, Nem ve Basınç Sensörü Kütüphanesi
"""

from array import array

from ustruct import unpack, unpack_from

# BME280 varsayılan adres
BME280_I2C_ADDR = 0x76


class BME280:
    def __init__(self, mode=3, i2c=None, address=BME280_I2C_ADDR):
        self.i2c = i2c
        self.address = address

        # Chip ID kontrolü
        chip_id = self.i2c.readfrom_mem(self.address, 0xD0, 1)[0]
        if chip_id != 0x60:
            raise RuntimeError(f"BME280 bulunamadı! Chip ID: {hex(chip_id)}")

        # Kalibrasyon verilerini oku
        self._read_calibration()

        # Sensör ayarları (normal mode, oversampling)
        self.i2c.writeto_mem(self.address, 0xF2, bytes([0x01]))
        self.i2c.writeto_mem(self.address, 0xF4, bytes([0x27]))
        self.i2c.writeto_mem(self.address, 0xF5, bytes([0xA0]))

        self.t_fine = 0

    def _read_calibration(self):
        """Kalibrasyon verilerini oku"""
        coeff = self.i2c.readfrom_mem(self.address, 0x88, 24)
        coeff = unpack("<HhhHhhhhhhhh", coeff)

        coeff_h = self.i2c.readfrom_mem(self.address, 0xA1, 1) + self.i2c.readfrom_mem(
            self.address, 0xE1, 7
        )
        coeff_h = unpack("<BbBbbb", coeff_h)

        self.dig_T1, self.dig_T2, self.dig_T3 = coeff[0:3]
        (
            self.dig_P1,
            self.dig_P2,
            self.dig_P3,
            self.dig_P4,
            self.dig_P5,
            self.dig_P6,
            self.dig_P7,
            self.dig_P8,
            self.dig_P9,
        ) = coeff[3:12]

        self.dig_H1 = coeff_h[0]
        self.dig_H2 = coeff_h[1]
        self.dig_H3 = coeff_h[2]
        self.dig_H4 = (coeff_h[3] << 4) | (coeff_h[4] & 0x0F)
        self.dig_H5 = (coeff_h[5] << 4) | (coeff_h[4] >> 4)
        self.dig_H6 = coeff_h[6]

    def read_raw_data(self):
        """Ham veriyi oku"""
        data = self.i2c.readfrom_mem(self.address, 0xF7, 8)
        pressure_raw = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
        temp_raw = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4)
        humidity_raw = (data[6] << 8) | data[7]
        return temp_raw, pressure_raw, humidity_raw

    def compensate_temperature(self, raw):
        """Sıcaklık kompanzasyonu"""
        var1 = ((raw >> 3) - (self.dig_T1 << 1)) * (self.dig_T2 >> 11)
        var2 = (((raw >> 4) - self.dig_T1) * ((raw >> 4) - self.dig_T1) >> 12) * (
            self.dig_T3 >> 14
        )
        self.t_fine = var1 + var2
        return (self.t_fine * 5 + 128) >> 8

    def compensate_pressure(self, raw):
        """Basınç kompanzasyonu"""
        var1 = self.t_fine - 128000
        var2 = var1 * var1 * self.dig_P6
        var2 = var2 + ((var1 * self.dig_P5) << 17)
        var2 = var2 + (self.dig_P4 << 35)
        var1 = ((var1 * var1 * self.dig_P3) >> 8) + ((var1 * self.dig_P2) << 12)
        var1 = (((1 << 47) + var1) * self.dig_P1) >> 33

        if var1 == 0:
            return 0

        p = 1048576 - raw
        p = (((p << 31) - var2) * 3125) // var1
        var1 = (self.dig_P9 * (p >> 13) * (p >> 13)) >> 25
        var2 = (self.dig_P8 * p) >> 19
        p = ((p + var1 + var2) >> 8) + (self.dig_P7 << 4)
        return p

    def compensate_humidity(self, raw):
        """Nem kompanzasyonu"""
        h = self.t_fine - 76800
        h = (
            (((raw << 14) - (self.dig_H4 << 20) - (self.dig_H5 * h)) + 16384) >> 15
        ) * (
            (
                (
                    (
                        (
                            ((h * self.dig_H6) >> 10)
                            * (((h * self.dig_H3) >> 11) + 32768)
                        )
                        >> 10
                    )
                    + 2097152
                )
                * self.dig_H2
                + 8192
            )
            >> 14
        )
        h = h - (((((h >> 15) * (h >> 15)) >> 7) * self.dig_H1) >> 4)
        h = 0 if h < 0 else h
        h = 419430400 if h > 419430400 else h
        return h >> 12

    @property
    def values(self):
        """Tüm değerleri oku"""
        temp_raw, press_raw, hum_raw = self.read_raw_data()

        temp = self.compensate_temperature(temp_raw)
        press = self.compensate_pressure(press_raw)
        hum = self.compensate_humidity(hum_raw)

        return (
            f"{temp / 100:.2f}C",
            f"{press / 256 / 100:.2f}hPa",
            f"{hum / 1024:.2f}%",
        )

    @property
    def temperature(self):
        """Sadece sıcaklık"""
        temp_raw, _, _ = self.read_raw_data()
        return self.compensate_temperature(temp_raw) / 100

    @property
    def pressure(self):
        """Sadece basınç"""
        _, press_raw, _ = self.read_raw_data()
        return self.compensate_pressure(press_raw) / 25600

    @property
    def humidity(self):
        """Sadece nem"""
        _, _, hum_raw = self.read_raw_data()
        return self.compensate_humidity(hum_raw) / 1024
