import { cachedCitiesStr } from '../utils/cityService.js'; 

// indexController.js
export async function index(req, res, next) {
  try {
    // res.locals.isAuthenticated is already globally handled by your app.use now!
    res.locals.citiesServed = cachedCitiesStr; 
    return res.render("index"); 
  } catch (error) { 
    return next(error); 
  } 
}
