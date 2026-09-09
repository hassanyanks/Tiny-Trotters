import mongoose from 'mongoose';
import { createClient } from 'redis';
import 'dotenv/config'; // Loads variables from a local .env file during local testing

async function verifyBridge() {
  console.log('🚀 Starting Render Redis to MongoDB bridge verification...');

  // 1. Initialize MongoDB Connection
  let mongoConnected = false;
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Fails fast if IP whitelist is blocking you
    });
    console.log('✅ Connected successfully to MongoDB Atlas.');
    mongoConnected = true;
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed!');
    console.error(`Error details: ${error.message}`);
    console.error('👉 Tip: Check your MongoDB Atlas Network Access whitelist for Render IPs.');
  }

  // 2. Initialize Redis Connection
  let redisConnected = false;
  const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      // Render Redis requires TLS/SSL (rediss:// format)
      tls: process.env.REDIS_URL?.startsWith('rediss://')
    }
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });

  try {
    console.log('⏳ Connecting to Render Redis...');
    await redisClient.connect();
    console.log('✅ Connected successfully to Render Redis.');
    redisConnected = true;
  } catch (error) {
    console.error('❌ Render Redis Connection Failed!');
    console.error(`Error details: ${error.message}`);
  }

  // 3. Hydration Logic Simulation (The Bridge)
  if (mongoConnected && redisConnected) {
    try {
      console.log('\n🔄 Simulating Initial Hydration Bridge...');
      
      // Step A: Set a temporary test value in Redis
      const testKey = 'render_hydration_test';
      const testValue = `Verified at ${new Date().toISOString()}`;
      
      await redisClient.set(testKey, testValue, { EX: 60 }); // Auto-expires in 60s
      console.log(`🔹 [Redis] Saved temporary hydration flag: "${testKey}"`);

      // Step B: Retrieve it back to confirm data read/write works smoothly
      const cachedValue = await redisClient.get(testKey);
      console.log(`🔹 [Redis] Successfully fetched back flag: "${cachedValue}"`);

      // Step C: Check Mongo operational state
      const adminDb = mongoose.connection.db.admin();
      const status = await adminDb.serverStatus();
      console.log(`🔹 [MongoDB] Operational. Atlas Server Version: ${status.version}`);

      console.log('\n🎉 SUCCESS! The network bridge between Render, Redis, and Mongo is fully operational.');
    } catch (bridgeError) {
      console.error('❌ Data operation bridge failed during simulation:', bridgeError.message);
    } finally {
      // Cleanup connections
      await redisClient.disconnect();
      await mongoose.disconnect();
      console.log('🔌 Connections closed safely.');
    }
  } else {
    console.log('\n🛑 Verification halted. Resolve connection errors above before testing the bridge.');
    // Force exit if connections hung
    process.exit(1);
  }
}

verifyBridge();
