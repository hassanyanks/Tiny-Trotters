import { cachedCitiesStr } from '../utils/cityService.js';
import { getCityAndState } from './eventService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import ScheduledEvent from "../models/scheduled_event.js";

export const waiverDone = asyncHandler(async(req, res, next) => {
  try { 

    const eventMongoDbId = req.body.eventMongoDbId;
    await Promise.all([
      EventType.find().sort({name: 1}),
      Accessory.find().sort({name: 1}),
      Pony.find().sort({name: 1})
    ]);
ait 
    res.locals.citiesServed = cachedCitiesStr;
    res.render("index", { url:  '/waiver'} );

  } catch (error) {
    next(error);
  }
});

export const signWaiverGet = asyncHandler(async(req, res, next) => {
  try { 

    const cityAndState = await getCityAndState(req.query.venueZipcode);
    console.log(`city and state returned:  ${JSON.stringify(cityAndState)}`);

    res.locals.hostName = req.query.hostName;
    res.locals.venueAddress = cityAndState ? `${req.query.venueStreetAddress}, ${cityAndState.cityId.name}, ${cityAndState.stateId.name} ${req.query.venueZipcode}`
                                           : `${req.query.venueStreetAddress}, ${req.query.venueZipcode}`
    res.locals.hostPhone = req.query.hostPhone;
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.eventMongoDbId = req.query.eventMongoDbId;
    console.log(`****************************signWaiverGet eventMongoDbId:  ${res.locals.eventMongoDbId}`);

    res.render("waiver", { url:  '/waiver'} );

  } catch (error) {
    next(error);
  }
});

