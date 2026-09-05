import mongoose from 'mongoose';
import 'dotenv/config';
import redisClient from './redis.js';
import ScheduledEvent from '../models/scheduled_event.js';

export let dbInstance = null;

export async function initMongoDB() {
  try {
    const { MONGODB_USERNAME, DB_NAME, NODE_ENV } = process.env;
    const mongoDB = `mongodb+srv://${MONGODB_USERNAME}:` +
                                   `${NODE_ENV === 'production' ? process.env.MONGODB_PASSWORD : process.env.MONGODB_PASSWORD_DEV }` +
                                   `${NODE_ENV === 'production' ? process.env.MONGODB_DB_STR : process.env.MONGODB_DB_STR_DEV}/` +
                                   `${DB_NAME}`;

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

/**
 * Checks if the Redis cache is empty, and hydrates it from Mongo using Mongoose Cursors.
 */
export async function initializeRedisCache() {

    // 1. Ensure Redis connection is active
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    redisClient.flushDb();
    //const size = await redisClient.dbSize();
    
    try {

      let recordCount = 0;

      const initialCacheCount = await redisClient.zCard('events:by_date');

      if (initialCacheCount === 0) {

        console.log(`✅ Redis cache empty. Found ${initialCacheCount} indexed events; hydrating Redis...`);

        const BATCH_SIZE = 1000;
        let batchPipeline = redisClient.multi();

        // 3. Use lean() to get raw objects instead of heavy Mongoose documents
        const cursor = ScheduledEvent.find({}, { 'waiverForm': 0 }).lean().cursor();
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
          const eventId = doc._id.toString();
          let timestamp;
          if( doc.details && doc.details['Event-Start']) {
            timestamp = doc.details['Event-Start'].getTime();
          } else if( doc.eventDetails && doc.eventDetails['Event-Start']) {
            timestamp = doc.eventDetails['Event-Start'].getTime();
          } else { timestamp = 0; }            

            // Stage payload string
            batchPipeline.set(`event:data:${eventId}`, JSON.stringify(doc), {
                EX: 86400 * 30 // 30-day cache lifespan
            });

            // Stage sorted set index entry
            batchPipeline.zAdd('events:by_date', {
                score: timestamp,
                value: eventId
            });

            recordCount++;

            // Batch execution management
            if (recordCount % BATCH_SIZE === 0) {
                await batchPipeline.exec();
                batchPipeline = redisClient.multi();
                console.log(`⏩ Hydrated ${recordCount} records via Mongoose...`);
            }
        }

        // Execute any remaining records in the final pipeline chunk
        if (recordCount % BATCH_SIZE !== 0) {
            await batchPipeline.exec();
        }
      }

      const cacheCount = await redisClient.zCard('events:by_date');
      if (cacheCount > 0) {
        console.log(`✅ Redis cache hydrated. Found ${cacheCount} indexed events.`);
      }

    } catch (error) {
        console.error('❌ Failed to warm up Redis cache from Mongoose:', error);
    }
}
