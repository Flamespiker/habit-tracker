import { connectToMongoDB } from './client'
import UserPreferences, { IUserPreferences } from './models/UserPreferences'

/**
 * Fetches preferences for a user. Returns null if no preferences have been saved yet.
 */
export async function getUserPreferences(userId: string): Promise<IUserPreferences | null> {
  await connectToMongoDB()
  return UserPreferences.findOne({ user_id: userId }).lean<IUserPreferences>()
}

/**
 * Creates or updates preferences for a user.
 * Performs an upsert — safe to call even if no document exists yet.
 * Returns the full updated document.
 */
export async function saveUserPreferences(
  userId: string,
  prefs: Partial<Omit<IUserPreferences, 'user_id'>>
): Promise<IUserPreferences> {
  await connectToMongoDB()
  const doc = await UserPreferences.findOneAndUpdate(
    { user_id: userId },
    { $set: prefs },
    { upsert: true, new: true }
  ).lean<IUserPreferences>()
  // upsert: true guarantees a document is returned
  return doc!
}
