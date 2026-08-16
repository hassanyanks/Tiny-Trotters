import { cachedCitiesStr } from '../utils/cityService.js';

export const signWaiverGet = async(req, res, next) => {
  try {    
    res.locals.hostName = req.query.hostName;
    res.locals.hostAddress = req.query.hostAddress;
    res.locals.hostPhone = req.query.hostPhone;
    res.locals.citiesServed = cachedCitiesStr;
    res.render("sign_waiver", { url:  '/sign-waiver'} );
  } catch (error) {
    next(error);
  }
};

