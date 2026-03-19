import { connectToMongoDB } from './client'
import AiCoaching, { IAiCoaching } from './models/AiCoaching'

/**
 * Fetches the coaching history for a user, newest first.
 * @param limit - Max number of documents to return (default 20).
 */
export async function getCoachingHistory(
  userId: string,
  limit = 20
): Promise<IAiCoaching[]> {
  await connectToMongoDB()
  return AiCoaching
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean<IAiCoaching[]>()
}

/**
 * Saves a new AI coaching response to the database.
 * `created_at` is set automatically by the schema default.
 */
export async function saveCoachingResponse(
  data: Omit<IAiCoaching, 'created_at'>
): Promise<IAiCoaching> {
  await connectToMongoDB()
  const doc = await AiCoaching.create(data)
  return doc.toObject<IAiCoaching>()
}
