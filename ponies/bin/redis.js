import 'dotenv/config';
import { createClient } from 'redis';

const REDIS_PORT = process.env.NODE_ENV === 'production' ? 6379 : 6380;
const redisClient = createClient({
  url: `redis://127.0.0.1:${REDIS_PORT}`,
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

