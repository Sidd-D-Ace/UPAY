const mongoose = require('mongoose');

// Use environment variable if inside Docker, otherwise fallback to localhost
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoUrl = `mongodb://${mongoHost}:27017/Upay`;

async function connectMongo() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Connected to MongoDB at ${mongoHost}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Optional: Exit process on failure so Docker can restart it
    // process.exit(1); 
  }
}

module.exports = connectMongo;