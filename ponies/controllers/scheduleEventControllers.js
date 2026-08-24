import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import Pony from '../models/pony.js'
import ScheduledEvent from "../models/scheduled_event.js";
import { cachedCitiesStr } from '../utils/cityService.js';
import { sendScheduledEventEmail } from "../bin/emails.js";
import { createScheduledEvent } from "./eventService.js";
import { getEventDetails, getPoniesData, formatTime } from "./eventService.js";

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

export const eventSchedulePost = async(req, res, next) => {
  try { 

    const eventDetails = await getEventDetails(req.body);
    console.log(`*************************************getEventDetails() RETURNED: ${JSON.stringify(eventDetails)}  `)
    const poniesData = await getPoniesData(req.body);
    console.log(`*************************************getPoniesData() RETURNED: ${JSON.stringify(poniesData)}  `)

    res.locals.citiesServed = cachedCitiesStr;
    res.locals.venueStreetAddress = req.body['Event-Venue-Street-Address'];
    res.locals.venueCity = req.body['Event-City'];
    res.locals.venueZipcode = req.body['Event-Venue-Zipcode'];
    res.locals.venueState = req.body['Event-State'];
    res.locals.hostName = req.body['Event-Name'];
    res.locals.email = req.body['Event-Email'];
    res.locals.hostPhone = req.body['Event-Phone'];

    const result = await createScheduledEvent(eventDetails, poniesData);

    const details = result.toObject().details;
    const ponies = result.toObject().ponies;

    for (const [key, value] of Object.entries(details)) {
      if (key.includes('Start') || key.includes('End')) {
        details[key] = formatTime(String(value));
      }
    }

    res.locals.details = details;
    res.locals.ponies = ponies;
    res.locals.eventMongoDbId = result.id;

    console.log(`scheduled event result.details:  ${JSON.stringify(result)}`);
    console.log(`**************************customer data being passed to waiver:  ${res.locals.venueCity}//${res.locals.venueState}//${res.locals.venueStreetAddress}`)
    sendScheduledEventEmail(req.body['Event-Email'], res.locals);

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
