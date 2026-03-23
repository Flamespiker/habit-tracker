import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

/**
 * Cached connection state stored on the global object.
 * Next.js hot-reloads modules in development, so module-level variables reset on
 * every reload. The global object persists across reloads, keeping the connection alive.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  /** Pending connect() promise — prevents multiple simultaneous connection attempts. */
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};
global._mongooseCache = cached;

/**
 * Returns a cached Mongoose connection, creating one if none exists.
 * Safe to call on every request in a serverless environment — the connection
 * is reused across invocations within the same process.
 */
export async function connectToMongoDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      // Don't buffer Mongoose operations if the connection drops — fail fast.
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
