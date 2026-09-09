import 'dotenv/config';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL, //process.env.NODE_ENV === 'dev' ? 'redis://127.0.0.1:6379' : process.env.REDIS_URL,
  socket: {
    family: 4,            // Forces IPv4 resolution for Render's internal network
    connectTimeout: 10000 // Gives it 10 seconds to handshake
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis connected successfully!'));

// Trigger connection immediately in the background
redisClient.connect().catch((err) => {
    console.error('Failed to connect to Redis during startup:', err);
});

export default redisClient;

