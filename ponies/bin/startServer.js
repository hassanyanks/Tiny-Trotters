#!/usr/bin/env node
import app from '../app.js';
import { readFileSync } from 'node:fs';
import path from 'path';
import 'dotenv/config';

const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT : process.env.DEV_PORT;
//const PORT = process.env.PORT;
const HOST = process.env.HOST;
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

export async function startServer() {
  try {
    const __dirname = import.meta.dirname;
    const options = process.env.NODE_ENV === 'dev' ? {
                                              key: readFileSync(path.join(__dirname, '../samsKey.key')),
                                              cert: readFileSync(path.join(__dirname, '../samsCertificate.crt')),
                                              rejectUnauthorized: false,
                                            } : {};
    const serverObj = await import ('node:http');
    //const serverObj = process.env.NODE_ENV === 'dev' ? await import ('node:https') : await import ('node:http');
    console.log('starting server...')
    serverObj.createServer(options, app, (req, res) => {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self';");
      res.writeHead(200);
    }).listen(PORT, HOST, () => { console.log(`host ${HOST} listening on port ${PORT}`); });
  } catch(err) {
    console.error(`protocol is disabled!!:  ${err}`);
  }
}

