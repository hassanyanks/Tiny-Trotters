import { asyncHandler } from '../utils/asyncHandler.js';
import redisClient from '../bin/redis.js';
import 'dotenv/config';

/**
 * Fetches full event data within a specific timestamp range from JSON strings.
 * @param {number} startRange - Start Unix timestamp (ms)
 * @param {number} endRange - End Unix timestamp (ms)
 * @returns {Promise<Array<Object>>} Array of parsed event objects
 */
async function getEventsInRange(startRange, endRange) {
    // 1. Fetch matching event IDs from the sorted set
    const eventIds = await redisClient.zRange('events:by_date', startRange, endRange, {
        BY: 'SCORE'
    });

    if (eventIds.length === 0) {
        return [];
    }

    // 2. Initialize the pipeline
    const pipeline = redisClient.multi();

    // 3. Queue up string GET commands for each ID
    eventIds.forEach(eventId => {
        pipeline.get(`event:data:${eventId}`);
    });

    // 4. Execute all GET commands simultaneously 
    const rawResults = await pipeline.exec();

    // 5. Parse JSON strings and handle potential missing keys safely
    return rawResults.map((rawJson, index) => {
        if (!rawJson) return null; // Handles cases where index exists but data was deleted
        
        try {
            return {
                id: eventIds[index],
                ...JSON.parse(rawJson)
            };
        } catch (error) {
            console.error(`Failed to parse JSON for event ${eventIds[index]}:`, error);
            return null;
        }
    }).filter(event => event !== null); // Filter out any missing or corrupt data
}

export const getScheduledEvents = asyncHandler(async (req, res, next) => {

    try {

        const { start, end } = req.query; // Ensure these are ISO strings or Date objects

        const scheduledEvents = await getEventsInRange(start, end);
        console.log(`scheduled events being returned: ${JSON.stringify(scheduledEvents)}`);

        //const matchPattern = `${process.env.REDIS_EVENT_HASH_KEY}:${start}*`;
        //const scheduledEvents = [];
        //for await (const key of redisClient.scanIterator({ MATCH: matchPattern, COUNT: 100 })) {
        //    scheduledEvents.push(key);
        //}
        //console.log(`*******************scheduled events being passed to calendar:  ${JSON.stringify(scheduledEvents)}`)
        //const scheduledEvents = await ScheduledEvent.find({
        //    'eventDetails.Event-Start': {
        //    $gte: new Date(start),
        //    $lte: new Date(end)
        //    }
        //}, { waiverForm: 0 })
        //.sort({ 'eventDetails.Event-Start': 1 }); // 1 for ascending, -1 for descending


        //if( !scheduledEvents ) {
        //    throw new Error(`Error-fetching scheduled events: ${res.status}`); // Check for 500 errors
        //}
        //console.log(`mongodb returned event for start date: ${JSON.stringify(scheduledEvents)}`)
        //res.setHeader('Content-Type', 'application/json');
        //res.send(scheduledEvents);
        res.json( scheduledEvents );

    } catch( error ) {
        console.error(error);
        res.status(500).send('Server Error');
    }


});


