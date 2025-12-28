"""
MLX90614 Kızılötesi Sıcaklık Sensörü Kütüphanesi
"""


class MLX90614:
    def __init__(self, i2c, addr=0x5A):
        self.i2c = i2c
        self.addr = addr

    def read_reg(self, reg):
        """Register oku"""
        data = self.i2c.readfrom_mem(self.addr, reg, 2)
        return data[0] | (data[1] << 8)

    def read_ambient_temp(self):
        """Ortam sıcaklığını oku (°C)"""
        raw = self.read_reg(0x06)
        return (raw * 0.02) - 273.15

    def read_object_temp(self):
        """Nesne sıcaklığını oku (°C)"""
        raw = self.read_reg(0x07)
        return (raw * 0.02) - 273.15
