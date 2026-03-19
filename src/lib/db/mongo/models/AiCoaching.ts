import mongoose, { Schema, Model } from 'mongoose'

// Do not extend Document — Mongoose 6+ supports plain interfaces.
// Extending Document would conflict with its built-in `model()` method.
export interface IAiCoaching {
  user_id: string
  type: 'daily_nudge' | 'weekly_summary' | 'suggestion'
  /** Snapshot of habit data sent to the model — shape varies by type. */
  habit_context: unknown
  /** The generated coaching output — shape varies by type. */
  content: unknown
  created_at: Date
  model: string
}

const AiCoachingSchema = new Schema<IAiCoaching>(
  {
    user_id:       { type: String, required: true, index: true },
    type:          { type: String, enum: ['daily_nudge', 'weekly_summary', 'suggestion'], required: true },
    habit_context: { type: Schema.Types.Mixed },
    content:       { type: Schema.Types.Mixed, required: true },
    created_at:    { type: Date, default: Date.now },
    model:         { type: String, required: true },
  },
  { collection: 'ai_coaching' }
)

/**
 * Mongoose model for AI coaching insights.
 * Uses the singleton pattern — returns the existing compiled model on Next.js hot reloads
 * instead of throwing OverwriteModelError.
 */
const AiCoaching: Model<IAiCoaching> =
  (mongoose.models.AiCoaching as Model<IAiCoaching>) ||
  mongoose.model<IAiCoaching>('AiCoaching', AiCoachingSchema)

export default AiCoaching
