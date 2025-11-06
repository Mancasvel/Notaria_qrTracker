import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalWithMongoose {
  mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

const globalWithMongoose = global as typeof global & GlobalWithMongoose;

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(customUri?: string) {
  if (cached.conn) {
    return cached.conn;
  }

  // Get URI from parameter, environment variable, or fallback
  const MONGODB_URI = customUri || process.env.MONGODB_URI;
  
  if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  const uri = MONGODB_URI || 'mongodb://localhost:27017/notaria_db';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
