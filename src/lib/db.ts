import mongoose from 'mongoose';

// Define the type for the cached mongoose connection
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Declare the global variable without using var
declare const global: {
  mongoose?: MongooseCache;
} & typeof globalThis;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// For debugging - log the connection string with password masked
console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

// Reset the connection on each call in development
if (process.env.NODE_ENV === 'development') {
  global.mongoose = { conn: null, promise: null };
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      waitQueueTimeoutMS: 30000,
      heartbeatFrequencyMS: 1000,
      retryWrites: true,
      retryReads: true,
      autoIndex: true,
      autoCreate: true,
      family: 4,
    };

    console.log('Creating new database connection');
    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        
        // Set up connection event listeners
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          cached.conn = null;
          cached.promise = null;
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Attempting to reconnect...');
          cached.conn = null;
          cached.promise = null;
        });

        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected successfully');
        });

        mongoose.connection.on('timeout', () => {
          console.error('MongoDB operation timeout. Attempting to reconnect...');
          cached.conn = null;
          cached.promise = null;
        });

        return mongoose.connection;
      })
      .catch((err: Error) => {
        console.error('MongoDB connection error:', err);
        cached.promise = null; // Reset promise on error
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