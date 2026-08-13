import EventType from "../models/event_type.js";
import Accessory from "../models/accessory.js";
import Pony from '../models/pony.js'
import { cachedCitiesStr } from '../utils/cityService.js';
import { sendScheduledEventEmail } from "../bin/emails.js";

//controllers
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

function formatTime(generatedDatetimeValue) {
                console.log(`**************************generatedDatetimeValue:  ${generatedDatetimeValue}`);
            const [day,time] = generatedDatetimeValue.split('T')
                console.log(`**************************day, time:  ${day}//${time}`);

            const [hour,minutes] = time.split(':');
                console.log(`**************************hour, minutes:  ${hour}//${minutes}`);
            let hour12HrFormat = parseInt(hour) > 12 ? `${parseInt(hour) - 12} PM` : hour;
                console.log(`**************************hour12HrFormat:  ${hour12HrFormat}`);

}

function addOtherAccessories(accessoriesList, ponyNonStandardAccessories) {
  for(const[key,value] of Object.entries(ponyNonStandardAccessories) ) {
      accessoriesList.push(...value.split(','));
  }
  console.log(`pony accessories list after adding other: ${JSON.stringify(accessoriesList)}`);
}

export const eventSchedulePost = async(req, res, next) => {
  try { 

    const jsonData = JSON.stringify(req.body);
    const eventDetails = Object.fromEntries( Object.entries(req.body).filter(([key]) => key.includes('Event'))); //pulling in all fields data with name attribute containing 'Event'
    const ponyAccessoriesData = Object.fromEntries( Object.entries(req.body).filter(([key]) => key.includes('Pony'))); //pulling in all fields data with name attribute containing 'Pony'
    const ponies = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key,value]) => value === 'on')); //strip <pony name> from key/value pair '<pony name>:"[on|off]"'
    const ponyAccessories = {};

    if(eventDetails['Event Type'] === "Other") {
      eventDetails['Event Type'] = eventDetails['Event Other Type']
    } 

    delete eventDetails['Event Other Type'];

    console.log(`event details:  ${JSON.stringify(eventDetails)}`);

    console.log(`\t********************************************ponyAccessoriesData: ${JSON.stringify(ponyAccessoriesData)}`)

    //stripping <pony name> from string 'Pony <pony name>'
    for(const[key,value] of Object.entries(ponies)) {
      const pony = key.substring(5);
      ponyAccessories[pony] = {accessories: []}

      console.log(`pony ${pony}`)
      console.log(`\tponyAccessories: ${JSON.stringify(ponyAccessories)}`);

      const ponyAllAccessories = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key]) => key.includes(`Accessories ${pony}`)));
      const ponyStandardAccessories = Object.fromEntries( Object.entries(ponyAllAccessories).filter(([key]) => !key.includes(`Other`)));
      const ponyNonStandardAccessories = Object.fromEntries( Object.entries(ponyAllAccessories).filter(([key]) => key.includes(`Other`)));
      console.log(`\tponyAllAccessories: ${JSON.stringify(ponyAllAccessories)}`)
      console.log(`\tponyStandardAccessories: ${JSON.stringify(ponyStandardAccessories)}`)
      console.log(`\tponyNonStandardAccessories: ${JSON.stringify(ponyNonStandardAccessories)}`)

      console.log( `\tpony standard accessories object values:  ${Array.isArray(Object.values(ponyStandardAccessories))}`)

      if( Object.values(ponyStandardAccessories).flat().includes('Other')) {
        console.log( `\tpony accessories includes Other`)
        addOtherAccessories(ponyAccessories[pony].accessories, ponyNonStandardAccessories)
        }

      for(const[key,value] of Object.entries(ponyStandardAccessories) ) {
        console.log(`\taccessories list:  ${value}`);
        const accessoriesArray = Array.isArray(value) ? value : value.split(',');
        console.log(`\taccessories list:  ${accessoriesArray}`);
        ponyAccessories[pony].accessories.push(...accessoriesArray);
      }

      const index = Object.values(ponyAccessories[pony].accessories).indexOf('Other');
      if(index !== -1) {
        ponyAccessories[pony].accessories.splice(index, 1);
      }

      console.log(`\tpony final accessories list being sent to front: ${JSON.stringify(ponyAccessories[pony].accessories)}`);

    }

    //formatTime(generatedDatetimeValue)
    sendScheduledEventEmail(req.body['Event Email'], eventDetails, ponyAccessories);

    res.locals.citiesServed = cachedCitiesStr;
    res.locals.eventDetails = eventDetails;
    res.locals.ponyAccessoriesData = ponyAccessories;
    console.log(`res.locals.ponyAccessoriesData ${JSON.stringify(res.locals.ponyAccessoriesData)}`);
    res.locals.event_start = req.body.event_start,
    res.locals.event_end = req.body.event_end,
    res.locals.other_contact_details = req.body.other_contact_details,
    res.locals.email = req.body.email,
    res.locals.address = req.body.address
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
