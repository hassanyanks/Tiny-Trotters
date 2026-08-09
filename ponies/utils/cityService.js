import NodeCache from 'node-cache';
import City from '../models/City.js'; 
import State from '../models/State.js'; 

// Cache items for 1 hour (3600 seconds) by default
const cityCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const CACHE_KEY = 'cities_served_string';

const getCitiesServedString = async () => {
  // Check if data exists in cache
  const cachedData = cityCache.get(CACHE_KEY);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from database if cache is empty
  const cities = await City.find()
    .select('name stateId')
    .populate({ path: 'stateId', select: 'name' })
    .lean();

  // Format the data
  const citiesArr = cities.map((city) => {
    const state = city.stateId ? city.stateId.name : "";
    return `${city.name}, ${state}`;
  });
  
  const formattedCitiesStr = citiesArr.join("; ");

  // Save to cache
  cityCache.set(CACHE_KEY, formattedCitiesStr);
    console.log(`*********************cities:  ${JSON.stringify(formattedCitiesStr)}`);

  return formattedCitiesStr;
};

// Initialize as empty, then update immediately
export let cachedCitiesStr = "";

(async () => {
  try {
    cachedCitiesStr = await getCitiesServedString();
  } catch (error) {
    console.error("Failed to pre-fetch cities:", error);
  }
})();

