#!/usr/bin/env node
import app from '../app.js'
import { readFileSync } from 'node:fs';
import path from 'path';
import 'dotenv/config';

const PORT = process.env.PORT || 10000;
const HOST = process.env.NODE_ENV === 'production' ? process.env.HOST : 'localhost';
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

export async function startHttpsServer() {
  try {
    const __dirname = import.meta.dirname;
    const options = {
      key: readFileSync(path.join(__dirname, '../samsKey.key')),
      cert: readFileSync(path.join(__dirname, '../samsCertificate.crt')),
      rejectUnauthorized: false,
    };
    const https = await import ('node:https');
    console.log('starting server...')
    https.createServer(options, app, (req, res) => {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self';");
      res.writeHead(200);
    }).listen(PORT, HOST, () => { console.log(`server listening on port ${PORT}`); });
  } catch(err) {
    console.error(`HTTPS is disabled!!:  ${err}`);
  }
}
