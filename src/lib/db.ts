import mongoose, { Schema, Document } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// For debugging - log the connection string with password masked
console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the type for the cached mongoose connection
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Add mongoose to the NodeJS global type
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } | undefined;
}

// Reset the connection on each call in development
if (process.env.NODE_ENV === 'development') {
  global.mongoose = { conn: null, promise: null };
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new database connection');
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose.connection;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to establish database connection:', error);
    // Reset the promise so we can try again
    cached.promise = null;
    throw error;
  }
}

export default dbConnect; 