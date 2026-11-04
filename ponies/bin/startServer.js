//DESIGN NOTES:
//  1.  In production, Cloudflare tunnel handles https and is expecting http from our server
//  2.  In dev, want to ensure our server uses https without the tunnel and with communicatin to external mongodb


import redisClient from './redis.js';
import { initMongoDB } from './mongodb.js';
import { initializeRedisCache } from './mongodb.js';
import path from 'path';
import 'dotenv/config'; // This automatically runs dotenv.config() for your root .env file
import app, { initSessions } from '../app.js';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'url';
import { readFileSync } from 'node:fs';

const __dirname = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? (process.env.PORT || '3001') : '3001';
const HOST = isProduction ? (process.env.HOST || 'localhost') : 'localhost';

const networkOptions = {
  port: PORT,
  host: HOST
};

// FIX 1: Lazily initialize cert options only in development so production doesn't crash trying to read missing files
const getCertConfigOptions = () => {
  if (isProduction) return {};
  return {
    key: readFileSync(path.join(__dirname, '../samsKey.key')),
    cert: readFileSync(path.join(__dirname, '../samsCertificate.crt')),
    rejectUnauthorized: false,
  };
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

async function startServer() {
  try {

    const [mongoDbInstance, redisReady] = await Promise.all([initMongoDB(), redisClient.isOpen]);
    if( mongoDbInstance === 'tiny-trotters' && redisReady ) {
      initializeRedisCache();
    } else {
      console.error(`Not starting server: mongodb connection: ${mongoDbInstance}`);
    }

    initSessions(redisClient);

    const server = isProduction 
      ? http.createServer(app) 
      : https.createServer(getCertConfigOptions(), app);
      
    console.log('starting server...');
    server.listen(networkOptions, () => { 
      console.log(`host ${HOST} listening on port ${PORT}`); 
    });

  } catch(err) {
    console.error(`failed to start server:  ${err}`);
  }
}

try {
} catch (error) {
    console.error('Failed to start server:', error);
}

startServer();
