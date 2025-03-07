// Simple script to test MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 