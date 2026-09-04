import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import Pony from '../models/pony.js'
import ScheduledEvent from "../models/scheduled_event.js";
import { cachedCitiesStr } from '../utils/cityService.js';
import { sendScheduledEventEmail } from "../bin/emails.js";
import { createScheduledEvent } from "./eventService.js";
import { getEventDetails, getPoniesData, formatTime, fullAddress, getDetails } from "./eventService.js";
import redisClient from "../bin/redis.js";
import 'dotenv/config';

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

async function syncMongoEventToRedis(mongoEventDoc) {
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

    await pipeline.exec();
}

export const eventSchedulePost = async(req, res, next) => {
  try { 

    const yourDetails = await getDetails(req.body, 'Your' );
    const venueDetails = await getDetails(req.body, 'Venue' );
    const eventDetails = await getEventDetails(req.body);
    console.log(`*************************************getEventDetails() RETURNED: ${JSON.stringify(eventDetails)}  `)
    const poniesData = await getPoniesData(req.body);
    console.log(`*************************************getPoniesData() RETURNED: ${JSON.stringify(poniesData)}  `)

    let customerAddress = await fullAddress( req.body['Your-Street-Address'], req.body['Your-Zipcode'] );
    res.locals.customerAddress = customerAddress
    console.log(`****************customer address:  ${res.locals.customerAddress}`);

    //the below get passed to waiver form to populate signature/info blocks that follow the waiver statement on the waiver form
    res.locals.customerName   = req.body['Your-Name'];
    res.locals.customerEmail  = req.body['Your-Email'];
    res.locals.customerPhone  = req.body['Your-Phone'];

    if( req.body['Event-Location'] === 'Another Venue' ) {

      res.locals.venueName   = req.body['Venue-Name'];
      res.locals.venueContactName   = req.body['Venue-Contact-Name'];
      res.locals.venueEmail  = req.body['Venue-Email'];
      res.locals.venuePhone  = req.body['Venue-Phone'];

      let venueAddress = await fullAddress( req.body['Venue-Street-Address'], req.body['Venue-Zipcode'] );                         ;
      res.locals.venueAddress = venueAddress;
      console.log(`****************venue address:  ${res.locals.venueAddress}`);

    }

    res.locals.eventLocation = req.body['Event-Location'];
    console.log(`****************event location passed OUT:  ${res.locals.eventLocation}`);
    res.locals.citiesServed = cachedCitiesStr;

    const result = await createScheduledEvent(eventDetails, yourDetails, venueDetails, poniesData);
    console.log(`scheduled event result:  ${JSON.stringify(result)}`);

    const evtDetails = result.toObject().eventDetails;
    const ponies = result.toObject().ponies;

    for (const [key, value] of Object.entries(evtDetails)) {
      if (key.includes('Start') || key.includes('End')) {
        evtDetails[key] = formatTime(String(value));
        }
    }

    // Redis
    syncMongoEventToRedis(result)
    
    res.locals.eventDetails = evtDetails;
    res.locals.yourDetails = yourDetails;
    res.locals.venueDetails = venueDetails ? venueDetails : null
    res.locals.ponies = ponies;
    res.locals.eventMongoDbId = result.id;

    sendScheduledEventEmail(req.body['Your-Email'], res.locals);

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
