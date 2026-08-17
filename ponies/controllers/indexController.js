import { cachedCitiesStr } from '../utils/cityService.js'; 

export const index = async (req, res, next) => {
  try {
    res.locals.citiesServed = cachedCitiesStr; 
    return res.render("index"); 

  } catch (error) { 
    return next(error); 
  } 
};
