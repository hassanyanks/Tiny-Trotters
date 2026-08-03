#!/usr/bin/env node
import app from '../app.js'
import { readFileSync } from 'node:fs';
import path from 'path';
import 'dotenv/config';

const PORT = process.env.NODE_ENV === 'production' ? process.env.DEFAULT_PORT : process.env.PORT;
const HOST = process.env.NODE_ENV === 'production' ? process.env.PROD_HOST : process.env.DEV_HOST;
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

export async function startHttpsServer() {
  try {
    const options = {
      rejectUnauthorized: false,
    };
    const https = await import ('node:https');
    console.log('starting server...')
    https.createServer(options, app, (req, res) => {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self';");
      res.writeHead(200);
    }).listen(PORT, HOST, () => { console.log(`host ${HOST} listening on port ${PORT}`); });
  } catch(err) {
    console.error(`HTTPS is disabled!!:  ${err}`);
  }
}
