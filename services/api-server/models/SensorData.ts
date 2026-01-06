import mongoose, { Document, Schema } from "mongoose";

export interface ISensorData extends Document {
  timestamp: Date;
  temperature: number;
  humidity: number;
  bodyTemperature: number;
  deviceId: string;
  alerts?: Array<{
    type: string;
    value: number;
    threshold: { min?: number; max?: number };
  }>;
}

const SensorDataSchema = new Schema<ISensorData>(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: -1, // Descending index for latest queries
    },
    temperature: {
      type: Number,
      required: true,
      min: -10,
      max: 50,
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    bodyTemperature: {
      type: Number,
      required: true,
      min: 10, // MLX90614 can read room temperature (10-50°C range)
      max: 50,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    alerts: [
      {
        type: {
          type: String,
          enum: [
            "temperature_high",
            "temperature_low",
            "humidity_high",
            "humidity_low",
            "body_temp_high",
            "body_temp_low",
          ],
        },
        value: Number,
        threshold: {
          min: Number,
          max: Number,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// TTL Index: Auto-delete documents older than 30 days
SensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Compound index for deviceId + timestamp queries
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export const SensorData = mongoose.model<ISensorData>(
  "SensorData",
  SensorDataSchema
);
