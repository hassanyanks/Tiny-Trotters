import { cachedCitiesStr } from '../utils/cityService.js';

export const index = async (req, res, next) => {
  try {    
    // Attach to res.locals and render
    res.locals.citiesServed = cachedCitiesStr;
    res.render("index");
  } catch (error) {
    next(error);
  }
};
