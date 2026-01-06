import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import { SensorData } from "./models/SensorData";
import { ThresholdSettings } from "./models/ThresholdSettings";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/baby-crib-db";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Get thresholds from database or use defaults
async function getThresholdsFromDB(deviceId: string) {
  try {
    let thresholdDoc = await ThresholdSettings.findOne({ deviceId }).lean();

    // Eğer cihaz için threshold yoksa, çok geniş varsayılan değerler oluştur
    // Kullanıcı Settings sayfasında kendi değerlerini girecek
    if (!thresholdDoc) {
      console.log(
        `Creating wide default thresholds for device: ${deviceId} - User should set custom values in Settings`
      );
      const newThreshold = new ThresholdSettings({
        deviceId,
        thresholds: {
          temperature: { min: 0, max: 100 }, // Geniş aralık - kullanıcı ayarlayacak
          humidity: { min: 0, max: 100 }, // Geniş aralık - kullanıcı ayarlayacak
          bodyTemperature: { min: 0, max: 100 }, // Geniş aralık (hipotermiden ateşe kadar)
        },
      });
      const saved = await newThreshold.save();
      return saved.thresholds;
    }

    return thresholdDoc.thresholds;
  } catch (error) {
    console.error(`Error fetching thresholds for ${deviceId}:`, error);
    // Hata durumunda çok geniş fallback değerler - hiçbir uyarı gelmesin
    return {
      temperature: { min: -10, max: 50 },
      humidity: { min: 0, max: 100 },
      bodyTemperature: { min: 10, max: 50 },
    };
  }
}

// Helper function to check thresholds and generate alerts
function checkThresholds(
  data: {
    temperature: number;
    humidity: number;
    bodyTemperature: number;
  },
  thresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    bodyTemperature: { min: number; max: number };
  }
): Array<{
  type: string;
  value: number;
  threshold: { min?: number; max?: number };
}> {
  const alerts: Array<{
    type: string;
    value: number;
    threshold: { min?: number; max?: number };
  }> = [];

  if (data.temperature < thresholds.temperature.min) {
    alerts.push({
      type: "temperature_low",
      value: data.temperature,
      threshold: thresholds.temperature,
    });
  } else if (data.temperature > thresholds.temperature.max) {
    alerts.push({
      type: "temperature_high",
      value: data.temperature,
      threshold: thresholds.temperature,
    });
  }

  if (data.humidity < thresholds.humidity.min) {
    alerts.push({
      type: "humidity_low",
      value: data.humidity,
      threshold: thresholds.humidity,
    });
  } else if (data.humidity > thresholds.humidity.max) {
    alerts.push({
      type: "humidity_high",
      value: data.humidity,
      threshold: thresholds.humidity,
    });
  }

  if (data.bodyTemperature < thresholds.bodyTemperature.min) {
    alerts.push({
      type: "body_temp_low",
      value: data.bodyTemperature,
      threshold: thresholds.bodyTemperature,
    });
  } else if (data.bodyTemperature > thresholds.bodyTemperature.max) {
    alerts.push({
      type: "body_temp_high",
      value: data.bodyTemperature,
      threshold: thresholds.bodyTemperature,
    });
  }

  return alerts;
}

// Routes

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST /api/sensors - Receive sensor data from ESP32
app.post(
  "/api/sensors",
  [
    body("temperature")
      .isFloat({ min: -10, max: 50 })
      .withMessage("Invalid temperature"),
    body("humidity")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Invalid humidity"),
    body("bodyTemperature")
      .isFloat({ min: 10, max: 50 })
      .withMessage("Invalid body temperature (must be between 10-50°C)"),
    body("deviceId").isString().notEmpty().withMessage("Device ID is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { temperature, humidity, bodyTemperature, deviceId } = req.body;

      // Get dynamic thresholds from database
      const thresholds = await getThresholdsFromDB(deviceId);

      console.log(
        `🔍 Thresholds for ${deviceId}:`,
        JSON.stringify(thresholds, null, 2)
      );
      console.log(`📊 Received sensor data:`, {
        temperature,
        humidity,
        bodyTemperature,
      });

      // Check thresholds
      const alerts = checkThresholds(
        {
          temperature,
          humidity,
          bodyTemperature,
        },
        thresholds
      );

      console.log(
        `🚨 Generated alerts:`,
        alerts.length > 0 ? JSON.stringify(alerts, null, 2) : "No alerts"
      );

      // Save to MongoDB
      const sensorData = new SensorData({
        temperature,
        humidity,
        bodyTemperature,
        deviceId,
        timestamp: new Date(),
        alerts: alerts.length > 0 ? alerts : undefined,
      });

      await sensorData.save();

      // Broadcast to all connected WebSocket clients
      const broadcastData = {
        id: sensorData._id.toString(),
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        bodyTemperature: sensorData.bodyTemperature,
        deviceId: sensorData.deviceId,
        timestamp: sensorData.timestamp.toISOString(),
        alerts: sensorData.alerts || [],
      };

      console.log(
        `📡 Broadcasting to WebSocket clients:`,
        JSON.stringify(broadcastData, null, 2)
      );
      io.emit("sensorData", broadcastData);

      console.log(`✅ Sensor data received from ${deviceId}:`, {
        temperature,
        humidity,
        bodyTemperature,
        alerts: alerts.length > 0 ? alerts.map((a) => a.type) : "none",
      });

      res.status(201).json({
        success: true,
        message: "Sensor data saved successfully",
        data: {
          id: sensorData._id,
          timestamp: sensorData.timestamp,
        },
      });
    } catch (error) {
      console.error("Error saving sensor data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save sensor data",
      });
    }
  }
);

// GET /api/sensors/latest - Get latest sensor data
app.get("/api/sensors/latest", async (req: Request, res: Response) => {
  try {
    const deviceId = req.query.deviceId as string | undefined;
    const query = deviceId ? { deviceId } : {};

    const latestData = await SensorData.findOne(query)
      .sort({ timestamp: -1 })
      .lean();

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: "No sensor data found",
      });
    }

    res.json({
      success: true,
      data: {
        id: latestData._id.toString(),
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        bodyTemperature: latestData.bodyTemperature,
        deviceId: latestData.deviceId,
        timestamp: latestData.timestamp.toISOString(),
        alerts: latestData.alerts || [],
      },
    });
  } catch (error) {
    console.error("Error fetching latest sensor data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sensor data",
    });
  }
});

// GET /api/sensors/history - Get sensor data history
app.get("/api/sensors/history", async (req: Request, res: Response) => {
  try {
    const deviceId = req.query.deviceId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const hours = parseInt(req.query.hours as string) || 1;

    const query: any = {};
    if (deviceId) {
      query.deviceId = deviceId;
    }

    // Get data from last X hours
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    query.timestamp = { $gte: startTime };

    const history = await SensorData.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: history.length,
      data: history.map((item) => ({
        id: item._id.toString(),
        temperature: item.temperature,
        humidity: item.humidity,
        bodyTemperature: item.bodyTemperature,
        deviceId: item.deviceId,
        timestamp: item.timestamp.toISOString(),
        alerts: item.alerts || [],
      })),
    });
  } catch (error) {
    console.error("Error fetching sensor history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sensor history",
    });
  }
});

// Legacy endpoint for frontend compatibility
app.get("/v1/values", async (_req: Request, res: Response) => {
  try {
    const latestData = await SensorData.findOne()
      .sort({ timestamp: -1 })
      .lean();

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: "No sensor data found",
      });
    }

    res.json({
      temperature: latestData.temperature,
      humidity: latestData.humidity,
      bodyTemperature: latestData.bodyTemperature,
      timestamp: latestData.timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching values:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch values",
    });
  }
});

// GET /api/settings/thresholds - Get threshold settings
app.get("/api/settings/thresholds", async (req: Request, res: Response) => {
  try {
    const deviceId = (req.query.deviceId as string) || "esp32-besik-01";

    const thresholdDoc = await ThresholdSettings.findOne({ deviceId }).lean();

    if (!thresholdDoc) {
      // Kullanıcı henüz ayarlamamışsa geniş varsayılan değerler dön
      return res.json({
        success: true,
        data: {
          deviceId,
          thresholds: {
            temperature: { min: 10, max: 40 }, // Geniş aralık - kullanıcı ayarlayacak
            humidity: { min: 20, max: 80 }, // Geniş aralık - kullanıcı ayarlayacak
            bodyTemperature: { min: 32, max: 42 }, // Geniş aralık
          },
          updatedAt: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      data: {
        deviceId: thresholdDoc.deviceId,
        thresholds: thresholdDoc.thresholds,
        updatedAt: thresholdDoc.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch threshold settings",
    });
  }
});

// PUT /api/settings/thresholds - Update threshold settings
app.put(
  "/api/settings/thresholds",
  [
    body("deviceId").isString().notEmpty().withMessage("Device ID is required"),
    body("thresholds.temperature.min")
      .isFloat({ min: -10, max: 50 })
      .withMessage("Invalid temperature min"),
    body("thresholds.temperature.max")
      .isFloat({ min: -10, max: 50 })
      .withMessage("Invalid temperature max"),
    body("thresholds.humidity.min")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Invalid humidity min"),
    body("thresholds.humidity.max")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Invalid humidity max"),
    body("thresholds.bodyTemperature.min")
      .isFloat({ min: 10, max: 60 })
      .withMessage("Invalid body temperature min"),
    body("thresholds.bodyTemperature.max")
      .isFloat({ min: 10, max: 60 })
      .withMessage("Invalid body temperature max"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { deviceId, thresholds } = req.body;

      // Validate min < max
      if (thresholds.temperature.min >= thresholds.temperature.max) {
        return res.status(400).json({
          success: false,
          message: "Temperature min must be less than max",
        });
      }

      if (thresholds.humidity.min >= thresholds.humidity.max) {
        return res.status(400).json({
          success: false,
          message: "Humidity min must be less than max",
        });
      }

      if (thresholds.bodyTemperature.min >= thresholds.bodyTemperature.max) {
        return res.status(400).json({
          success: false,
          message: "Body temperature min must be less than max",
        });
      }

      // Update or create threshold settings
      const updatedThreshold = await ThresholdSettings.findOneAndUpdate(
        { deviceId },
        { deviceId, thresholds },
        { new: true, upsert: true }
      );

      console.log(
        `Threshold settings updated for device ${deviceId}:`,
        thresholds
      );

      res.json({
        success: true,
        message: "Threshold settings updated successfully",
        data: {
          deviceId: updatedThreshold.deviceId,
          thresholds: updatedThreshold.thresholds,
          updatedAt: updatedThreshold.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating thresholds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update threshold settings",
      });
    }
  }
);

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send latest sensor data on connection
  SensorData.findOne()
    .sort({ timestamp: -1 })
    .lean()
    .then((latestData) => {
      if (latestData) {
        socket.emit("sensorData", {
          id: latestData._id.toString(),
          temperature: latestData.temperature,
          humidity: latestData.humidity,
          bodyTemperature: latestData.bodyTemperature,
          deviceId: latestData.deviceId,
          timestamp: latestData.timestamp.toISOString(),
          alerts: latestData.alerts || [],
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching initial data:", error);
    });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Handle client requests for latest data
  socket.on("requestLatestData", async () => {
    try {
      const latestData = await SensorData.findOne()
        .sort({ timestamp: -1 })
        .lean();
      if (latestData) {
        socket.emit("sensorData", {
          id: latestData._id.toString(),
          temperature: latestData.temperature,
          humidity: latestData.humidity,
          bodyTemperature: latestData.bodyTemperature,
          deviceId: latestData.deviceId,
          timestamp: latestData.timestamp.toISOString(),
          alerts: latestData.alerts || [],
        });
      }
    } catch (error) {
      console.error("Error fetching requested data:", error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(
    `CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close().then(() => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});
