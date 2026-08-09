import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import { cachedCitiesStr } from '../utils/cityService.js';

export const services = async(req, res, next) => {
  try {    
    const [eventTypes, accessories] = await Promise.all([
      EventType.find().sort({name: 1}),
      Accessory.find().sort({name: 1})
    ]);
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.eventTypes = eventTypes;
    res.locals.accessories = accessories;
     console.log(`*********************event types:  ${JSON.stringify(res.locals.eventTypes)}, accessories: ${JSON.stringify(res.locals.accessories) }`);
    res.render("services");
  } catch (error) {
    next(error);
  }
};
