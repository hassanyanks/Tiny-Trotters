import { cachedCitiesStr } from '../utils/cityService.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';

export const index = asyncHandler(async (req, res, next) => {
  try {
    res.locals.citiesServed = cachedCitiesStr; 
    const userRole = req.session.userRole;
    delete req.session.userRole;
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user || null; 
    return res.render("index"); 

  } catch (error) { 
    return next(error); 
  } 
});
