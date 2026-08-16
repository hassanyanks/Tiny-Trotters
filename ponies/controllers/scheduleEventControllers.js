import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import Pony from '../models/pony.js'
import { cachedCitiesStr } from '../utils/cityService.js';
import { sendScheduledEventEmail } from "../bin/emails.js";

export const eventScheduleGet = async(req, res, next) => {
  try {    
    const [eventTypes, accessories, ponies] = await Promise.all([
      EventType.find().sort({name: 1}),
      Accessory.find().sort({name: 1}),
      Pony.find().sort({name: 1})
    ]);
    res.locals.accessories = accessories;
    res.locals.eventTypes = eventTypes;
    res.locals.ponies = ponies;
    res.locals.citiesServed = cachedCitiesStr;
    res.render("schedule_event", { url:  '/schedule-event'} );
  } catch (error) {
    next(error);
  }
};

function formatTime(eventDetailsData) {
  const eventTimeData = Object.fromEntries( Object.entries(eventDetailsData).filter(([key]) => key.includes('Start') || key.includes('End'))); //pulling in all fields data with name attribute containing 'Event'
  for(const[key,value] of Object.entries(eventTimeData) ) {
    const [day,time] = value.split('T');
    const hour = parseInt(time.split(':')[0]);
    const minutes = time.split(':')[1]
    const time12HrFormatted =  hour > 12  ? `${hour-12}:${minutes} PM` 
                            : hour === 12 ? `${hour}:${minutes} PM` 
                            : `${hour}:${minutes} AM`
    eventDetailsData[key] = `${day} ${time12HrFormatted}`;
  }
}

function addOtherAccessories(accessoriesList, ponyNonStandardAccessories) {
  for(const[key,value] of Object.entries(ponyNonStandardAccessories) ) {
      accessoriesList.push(...value.split(','));
  }
}

export const eventSchedulePost = async(req, res, next) => {
  try { 

    const eventDetails = Object.fromEntries( Object.entries(req.body).filter(([key]) => key.includes('Event'))); //pulling in all fields data with name attribute containing 'Event'
    const ponyAccessoriesData = Object.fromEntries( Object.entries(req.body).filter(([key]) => key.includes('Pony'))); //pulling in all fields data with name attribute containing 'Pony'
    const ponyRolesData = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key]) => key.includes('Role')))
    const ponies = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key,value]) => value === 'on')); //strip <pony name> from key/value pair '<pony name>:"[on|off]"'
    const ponyAccessories = {};

    if(eventDetails['Event-Type'] === "Other") {
      eventDetails['Event-Type'] = eventDetails['Event-Other-Type']
    } 
    delete eventDetails['Event-Other-Type'];

    //change this checkbox value to better syntax; this particular code needed because unchecked checkbox is not included in req.body data
    eventDetails['Event-Active-Military/Veteran'] ? eventDetails['Event-Active-Military/Veteran'] = 'Yes' : eventDetails['Event-Active-Military/Veteran'] = 'No'

    //stripping <pony name> from string 'Pony <pony name>'
    for(const[key,value] of Object.entries(ponies)) {
      const pony = key.substring(5);
      ponyAccessories[pony] = {accessories: []}

      const ponyAllAccessories = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key]) => key.includes(`Accessories ${pony}`)));
      const ponyStandardAccessories = Object.fromEntries( Object.entries(ponyAllAccessories).filter(([key]) => !key.includes(`Other`)));
      const ponyNonStandardAccessories = Object.fromEntries( Object.entries(ponyAllAccessories).filter(([key]) => key.includes(`Other`)));

      if( Object.values(ponyStandardAccessories).flat().includes('Other')) {
        addOtherAccessories(ponyAccessories[pony].accessories, ponyNonStandardAccessories)
        }

      for(const[key,value] of Object.entries(ponyStandardAccessories) ) {
        console.log(`\taccessories list:  ${value}`);
        const accessoriesArray = Array.isArray(value) ? value : value.split(',');
        ponyAccessories[pony].accessories.push(...accessoriesArray);
      }

      const index = Object.values(ponyAccessories[pony].accessories).indexOf('Other');
      if(index !== -1) {
        ponyAccessories[pony].accessories.splice(index, 1);
      }

    }

    formatTime(eventDetails);

    res.locals.citiesServed = cachedCitiesStr;
    res.locals.eventDetails = eventDetails;
    res.locals.ponyAccessoriesData = ponyAccessories;
    res.locals.ponyRolesData = ponyRolesData;
    console.log(`res.locals.ponyAccessoriesData ${JSON.stringify(res.locals.ponyAccessoriesData)}`);
    const hostName = res.locals.hostName = req.body['Event-Name'];
    const hostPhone = res.locals.hostPhone = req.body['Event-Phone'];
    const hostAddress = res.locals.hostAddress = req.body['Event-Address'];
    

    console.log(`**************************customer data being passed to sign-waiver:  ${res.locals.hostName}//${res.locals.hostPhone}//${res.locals.hostAddress}`)
    sendScheduledEventEmail(req.body['Event-Email'], eventDetails, ponyAccessories, res.locals);

    res.render('scheduled_event', {
      url: '/scheduled-event',
    });   
  } catch (error) {
    next(error);
  }
};

export const scheduleEventCanceledPost = async(req, res, next) => {
  try {
    res.render('index');   
  } catch (error) {
    next(error);
  }
};
