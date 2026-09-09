import { cachedCitiesStr } from '../utils/cityService.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';

export const index = asyncHandler(async (req, res, next) => {
  try {
    res.locals.citiesServed = cachedCitiesStr; 
    const userRole = req.session.userRole;
    delete req.session.userRole;
    return res.render("index", { userRole }); 

  } catch (error) { 
    return next(error); 
  } 
});
