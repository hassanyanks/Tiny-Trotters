import { cachedCitiesStr } from '../utils/cityService.js';
import Picture from "../models/picture.js";
import { asyncHandler } from '../utils/asyncHandler.js';

export const pictures = asyncHandler(async(req, res, next) => {
    const pictures = await Picture.find().sort({name: 1});
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.pictures = pictures;
    res.render("gallery");
});
