import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import Pony from '../models/pony.js'
import { cachedCitiesStr } from '../utils/cityService.js';

export const eventSchedule = async(req, res, next) => {
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
     console.log(`*********************event types:  ${JSON.stringify(res.locals.eventTypes)}, accessories: ${JSON.stringify(res.locals.accessories) }`);
    res.render("schedule_event");
  } catch (error) {
    next(error);
  }
};