// services/eventService.js
import { dbInstance } from "../bin/mongodb.js";
import ScheduledEvent from "../models/scheduled_event.js";
import CityAddress from "../models/city_address.js";
import City from "../models/city.js";

export async function getCityAndState(zipcode) {
    const result = await CityAddress.findOne( { zipcode } );
    if( !result ) { return ''; } 
    return result;
}

export async function createScheduledEvent(eventDetails, poniesData) {
  try {

    const newEvent = await ScheduledEvent.create({
        details: eventDetails,
        ponies: poniesData
    });

    console.log("Event created successfully:", newEvent);
    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error.message);
  }
}

/* KEEIING FOR POSSIBLE FUTURE USE
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

*/

export async function getEventDetails(postRequestBody) {

    const eventDetails = Object.fromEntries( Object.entries(postRequestBody).filter(([key]) => key.includes('Event'))); //pulling in all fields data with name attribute containing 'Event'

    if(eventDetails['Event-Type'] === "Other") {
      eventDetails['Event-Type'] = eventDetails['Event-Other-Type']
    } 

    delete eventDetails['Event-Other-Type'];
    //change this checkbox value to better syntax; this particular code needed because unchecked checkbox is not included in req.body data
    eventDetails['Event-Active-Military/Veteran'] ? eventDetails['Event-Active-Military/Veteran'] = 'Yes' : eventDetails['Event-Active-Military/Veteran'] = 'No'
    //formatTime(eventDetails);

    return eventDetails;

}

function addOtherAccessories(accessoriesList, ponyNonStandardAccessories) {
  for(const[key,value] of Object.entries(ponyNonStandardAccessories) ) {
      accessoriesList.push(...value.split(','));
  }
}

export async function getPoniesData(postRequestBody) {

    const ponyAccessoriesData = Object.fromEntries( Object.entries(postRequestBody).filter(([key]) => key.includes('Pony'))); //pulling in all fields data with name attribute containing 'Pony'
    const ponies = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key,value]) => value === 'on')); //strip <pony name> from key/value pair '<pony name>:"[on|off]"'
    const poniesData = [];

    Object.entries(ponies).forEach(([key, value], index) => {
    //for(const[key,value] of Object.entries(ponies)) {

        const pony = key.substring(5);
        poniesData[index] = { name: pony, accessories: [], role: '' }

        const ponyAllAccessories = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key]) => key.includes(`Accessories ${pony}`)));
        const ponyStandardAccessories = Object.fromEntries( Object.entries(ponyAllAccessories).filter(([key]) => !key.includes(`Other`)));
        const ponyNonStandardAccessories = Object.fromEntries( Object.entries(ponyAllAccessories).filter(([key]) => key.includes(`Other`)));

        for(const[key,value] of Object.entries(ponyStandardAccessories) ) {
            console.log(`\taccessories list:  ${value}`);
            const accessoriesArray = Array.isArray(value) ? value : value.split(',');
            poniesData[index].accessories.push(...accessoriesArray);
        }

        if( Object.values(ponyStandardAccessories).flat().includes('Other')) {
            addOtherAccessories(poniesData[index].accessories, ponyNonStandardAccessories)
        }

        const i = Object.values(poniesData[index].accessories).indexOf('Other');
        if(i !== -1) {
            poniesData[index].accessories.splice(i, 1);
        }

        const ponyRole = Object.fromEntries( Object.entries(ponyAccessoriesData).filter(([key]) => key.includes(`Role ${pony}`)));
        poniesData[index].role = ponyRole[`Pony Role ${pony}`];

    });

    return poniesData;

}

export function formatTime(dateTimeValue) {
    console.log(`formatTime() incoming param:  ${JSON.stringify(dateTimeValue)}`);
    const [dayOfWeek, month, date, year, timeValue] = String(dateTimeValue).split(' ');
    const hour = parseInt(timeValue.split(':')[0]);
    const minutes = timeValue.split(':')[1]
    const time12HrFormatted =  hour > 12  ? `${hour-12}:${minutes} PM` 
                            : hour === 12 ? `${hour}:${minutes} PM` 
                            : `${hour}:${minutes} AM`
    const newDateTimeValue = `${dayOfWeek} ${month} ${date} ${year} ${time12HrFormatted}`
    console.log(`formatTime() return value:  ${newDateTimeValue}`)
    return newDateTimeValue;
}
