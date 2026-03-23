import mongoose, { Schema, Model } from "mongoose";

// Do not extend Document — Mongoose 6+ supports plain interfaces.
export interface IUserPreferences {
  user_id: string;
  coaching_style: "motivational" | "analytical" | "gentle";
  /** Daily nudge time, e.g. "08:00". */
  notification_time: string;
  /** Habit categories or topics the user wants to focus on. */
  focus_areas: string[];
  /** Catch-all for future preference fields without schema migrations. */
  custom_settings: unknown;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    user_id: { type: String, required: true, unique: true },
    coaching_style: {
      type: String,
      enum: ["motivational", "analytical", "gentle"],
      default: "motivational",
    },
    notification_time: { type: String, default: "08:00" },
    focus_areas: { type: [String], default: [] },
    custom_settings: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "user_preferences" },
);

/**
 * Mongoose model for per-user preferences stored in MongoDB.
 * Uses the singleton pattern — returns the existing compiled model on Next.js hot reloads
 * instead of throwing OverwriteModelError.
 */
const UserPreferences: Model<IUserPreferences> =
  (mongoose.models.UserPreferences as Model<IUserPreferences>) ||
  mongoose.model<IUserPreferences>("UserPreferences", UserPreferencesSchema);

export default UserPreferences;
