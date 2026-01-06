import mongoose, { Document, Schema } from "mongoose";

/**
 * ThresholdSettings Interface
 * Cihaz bazında dinamik eşik değerlerini saklar
 */
export interface IThresholdSettings extends Document {
  deviceId: string;
  thresholds: {
    temperature: {
      min: number;
      max: number;
    };
    humidity: {
      min: number;
      max: number;
    };
    bodyTemperature: {
      min: number;
      max: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ThresholdSettings Schema
 */
const ThresholdSettingsSchema = new Schema<IThresholdSettings>(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    thresholds: {
      temperature: {
        min: {
          type: Number,
          required: true,
          default: 20,
          min: -10,
          max: 50,
        },
        max: {
          type: Number,
          required: true,
          default: 26,
          min: -10,
          max: 50,
        },
      },
      humidity: {
        min: {
          type: Number,
          required: true,
          default: 45,
          min: 0,
          max: 100,
        },
        max: {
          type: Number,
          required: true,
          default: 65,
          min: 0,
          max: 100,
        },
      },
      bodyTemperature: {
        min: {
          type: Number,
          required: true,
          default: 36,
          min: 10, // Allow lower values for testing/room temp readings
          max: 50,
        },
        max: {
          type: Number,
          required: true,
          default: 37,
          min: 10,
          max: 50,
        },
      },
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);

/**
 * Validation: min < max kontrolü
 */
ThresholdSettingsSchema.pre("save", function (next) {
  const thresholds = this.thresholds;

  if (thresholds.temperature.min >= thresholds.temperature.max) {
    return next(new Error("Temperature min value must be less than max value"));
  }

  if (thresholds.humidity.min >= thresholds.humidity.max) {
    return next(new Error("Humidity min value must be less than max value"));
  }

  if (thresholds.bodyTemperature.min >= thresholds.bodyTemperature.max) {
    return next(
      new Error("Body temperature min value must be less than max value")
    );
  }

  next();
});

/**
 * Model Export
 */
export const ThresholdSettings = mongoose.model<IThresholdSettings>(
  "ThresholdSettings",
  ThresholdSettingsSchema
);
