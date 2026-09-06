import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import Pony from '../models/pony.js'
import ScheduledEvent from "../models/scheduled_event.js";
import { cachedCitiesStr } from '../utils/cityService.js';
import { sendScheduledEventEmail } from "../bin/emails.js";
import { createScheduledEvent } from "./eventService.js";
import { getPoniesData, formatTime, fullAddress, getDetails, redisFetchEvent } from "./eventService.js";
import redisClient from "../bin/redis.js";
import 'dotenv/config';

export const scheduleAnEvent = async(req, res, next) => {

};

export const eventScheduleGet = async(req, res, next) => {
  try {    
    const [eventTypes, accessories, ponies] = await Promise.all([
      EventType.find().sort({name: 1}),
      Accessory.find().sort({name: 1}),
      Pony.find().sort({name: 1})
    ]);
    res.locals.accessories = accessories;
    res.locals.eventTypes = eventTypes;
    res.locals.ponies = ponies;
    res.locals.citiesServed = cachedCitiesStr;
    res.render("schedule_event", { url:  '/schedule-event'} );
  } catch (error) {
    next(error);
  }
};

function addOtherAccessories(accessoriesList, ponyNonStandardAccessories) {
  for(const[key,value] of Object.entries(ponyNonStandardAccessories) ) {
      accessoriesList.push(...value.split(','));
  }
}

//import { MongoClient, ObjectId } from 'mongodb';

async function addEventToRedis(mongoEventDoc) {
  try {

    // 1. Extract the MongoDB ID as a clean text string
    const eventId = mongoEventDoc._id.toString(); 
    const timestamp = new Date(mongoEventDoc.eventDetails['Event-Start']).getTime();
    
    const pipeline = redisClient.multi();

    // 2. Cache the document in Redis using the MongoDB ID in the key
    pipeline.set(`event:data:${eventId}`, JSON.stringify(mongoEventDoc), {
        EX: 86400 * 30 // Cache for 30 days
    });

    // 3. Track the MongoDB ID in the sorted set date index
    pipeline.zAdd('events:by_date', {
        score: timestamp,
        value: eventId
    });

    await pipeline.exec() //all goes well, returns ["OK", 1]

  } catch (error) {
    console.error("Error adding event to redis:", error.message);
  }

}

export const eventSchedulePost = async(req, res, next) => {
  try { 

    const yourDetails = await getDetails(req.body, 'Your' );
    let customerAddress = await fullAddress( req.body['Your-Street-Address'], req.body['Your-Zipcode'] );
    yourDetails['Your-Full-Address'] = customerAddress;
    const venueDetails = await getDetails(req.body, 'Venue' );
    const eventDetails = await getDetails(req.body, 'Event');
   if( venueDetails ) {
      let venueAddress = await fullAddress( req.body['Venue-Street-Address'], req.body['Venue-Zipcode'] );                         ;
      venueDetails['Venue-Full-Address'] = venueAddress;
    }
    const poniesData = await getPoniesData(req.body);
 
    const result = await createScheduledEvent(eventDetails, yourDetails, venueDetails, poniesData);
    const eventId = result._id;

    // Redis
    await addEventToRedis(result);
    const eventFromRedis = await redisFetchEvent(eventId);
    const redisEventParsed = JSON.parse(eventFromRedis);
    redisEventParsed.eventDetails['Event-Start'] = formatTime(redisEventParsed.eventDetails['Event-Start']);
    redisEventParsed.eventDetails['Event-End'] = formatTime(redisEventParsed.eventDetails['Event-End']);

    res.locals.details = redisEventParsed;
    res.locals.citiesServed = cachedCitiesStr;

    sendScheduledEventEmail(req.body);

    res.render('scheduled_event', {
      url: '/scheduled-event',
    });   
  } catch (error) {
    next(error);
  }
};

export const scheduleEventCanceledPost = async(req, res, next) => {
  try {
    res.render('index');   
  } catch (error) {
    next(error);
  }
};
