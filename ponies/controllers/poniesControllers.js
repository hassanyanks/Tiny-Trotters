import Pony from "../models/pony.js";
import { cachedCitiesStr } from '../utils/cityService.js';

export const ponies = async(req, res, next) => {
  try {    
    const ponies = await Pony.find().sort({name: 1});
    // Attach to res.locals and render
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.ponies = ponies;
    res.render("ponies");
  } catch (error) {
    next(error);
  }
};


