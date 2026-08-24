import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import { cachedCitiesStr } from '../utils/cityService.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const services = asyncHandler(async(req, res, next) => {
  try {    
    const [eventTypes, accessories] = await Promise.all([
      EventType.find().sort({name: 1}),
      Accessory.find().sort({name: 1})
    ]);
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.eventTypes = eventTypes;
    res.locals.accessories = accessories;
    res.render("services");
  } catch (error) {
    next(error);
  }
});
