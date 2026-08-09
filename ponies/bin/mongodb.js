import mongoose from 'mongoose';
import 'dotenv/config';

export let dbInstance = null;

export async function initMongoDB() {
  try {
    const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DB_STR, DB_NAME } = process.env;
    const mongoDB = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}${MONGODB_DB_STR}/${DB_NAME}`;

    dbInstance = await mongoose.connect(mongoDB);

    if (dbInstance.connection.name !== 'tiny-trotters') {
      throw new Error('Could not connect to Mongo DB instance');
    }

    if (!mongoose.connection.listeners('disconnected').length) {
      mongoose.connection.on('disconnected', () => {
        console.log('Mongo db disconnected');
      });
    }

    return dbInstance.connection.name;
  } catch (err) {
    console.error(`error connecting to Mongo db: ${err}`);
    throw err;
  }
}

/*
export async function initMongoDB() {
    let dbInstance;
    try {
        const username = process.env.MONGODB_GLOBAL_USER; 
        const pswd = process.env.MONGODB_GLOBAL_PSWD;
        const url = `mongodb+srv://${username}:${pswd}${process.env.SAMS_MONGODB_STR}`;
        dbInstance = await mongoose.connect(url)
        console.log(`mongoose connect result: ${dbInstance.connection.name}`)
    } catch(err) {
        console.error(`error connecting to Mongo db:  ${err}`);
    } finally {
        return dbInstance;
    };


    .then(() => {
        console.log('successfully connected to Mongo db');
    })
    .catch(err => {
        console.error(`error connecting to Mongo db:  ${err}`);
        connected = false;
    })
    .finally(() => {
        mongoose.connection.on('disconnected', () => { console.log('Mongo db disconnected') });
        return connected;
    });
*/    

