// services/eventService.js
import ScheduledEvent from "../models/scheduled_event.js";
import CityAddress from "../models/city_address.js";
import redisClient from "../bin/redis.js";

export async function fullAddress( streetAddress, zipcode ) {

  try {

    let address = '';
    let zipcodeLookupResult = await getCityAndState(zipcode);

    if( zipcodeLookupResult ) {
      address = `${streetAddress} ${zipcodeLookupResult.cityId.name}, ${zipcodeLookupResult.stateId.name} ${zipcode}`;
    } else {
      address = `${streetAddress} <enter city here>, <enter state here>, ${zipcode}`;
    }

    return address;

  } catch( error ) {
    console.error("Error getting full addres:", error.message);
  }

}

export async function getScheduledEventData( eventId, data ) {

  try {

    const waiverForm = await ScheduledEvent.findOne( { _id: eventId }, { "`${data}`": 1, "_id": 0 } );
    return waiverForm;

  } catch( error ) {
    console.error("Error getting document:", error.message);
  }

}

export async function getCityAndState(zipcode) {

  try {

    const result = await CityAddress.findOne( { zipcode } );
    if( !result ) { return ''; } 
    return result;

  } catch( error ) {
    console.error("Error getting city address:", error.message);
  }

}

export async function updateScheduledEvent( eventId, setBody ) {

  try {
    const result = await ScheduledEvent.updateOne(
      { _id: eventId },
      {
        $set: setBody
      }
    );
    return result;

  } catch( error ) {
    console.error("Error adding file:", error.message);
  }

}

export async function createScheduledEvent(eventDetails, yourDetails, venueDetails, poniesData) {

  try {

    const newEvent = await ScheduledEvent.create({
        eventDetails,
        yourDetails,
        venueDetails,
        ponies: poniesData
    });

    console.log("Event created successfully:", newEvent);
    return newEvent;

  } catch (error) {
    console.error("Error creating event:", error.message);
  }

}

/* KEEPING FOR POSSIBLE FUTURE USE
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

export async function getDetails(postRequestBody, detailsIdentifier) {
  const details = Object.fromEntries( Object.entries(postRequestBody).filter(([key]) => key.includes(detailsIdentifier))); 

  if( detailsIdentifier === 'Your' ) {
    details['Your-Active-Military/Veteran'] ? details['Your-Active-Military/Veteran'] = 'Yes' : details['Your-Active-Military/Veteran'] = 'No'
  }

  if( detailsIdentifier === 'Event' ) {
    if(details['Event-Type'] === "Other") {
      details['Event-Type'] = details['Event-Other-Type']
      delete details['Event-Other-Type'];
    } 
  }

  return details;
}

/*
export async function getEventDetails(postRequestBody) {

    const eventDetails = Object.fromEntries( Object.entries(postRequestBody).filter(([key]) => key.includes('Event'))); //pulling in all fields data with name attribute containing 'Event'

    if(eventDetails['Event-Type'] === "Other") {
      eventDetails['Event-Type'] = eventDetails['Event-Other-Type']
    } 

    delete eventDetails['Event-Other-Type'];
    //change this checkbox value to better syntax; this particular code needed because unchecked checkbox is not included in req.body data

    return eventDetails;

}
*/

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

export function formatTime(isoStringFormattedTime) {
  try {

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = new Date(isoStringFormattedTime);

    const date = dateStr.getDate();
    const month = months[dateStr.getMonth()];
    const dayOfWeek = daysOfWeek[dateStr.getDay()];
    const year = dateStr.getFullYear();
    const tmpHrs = dateStr.getHours(); // >= 12 ? dateStr.getHours() - 12 : dateStr.getHours();
    const mins = dateStr.getMinutes();
    const meridiemSuffix = tmpHrs >= 12 ? 'PM' : 'AM'
    const hrs = dateStr.getHours() >= 12 ? dateStr.getHours() - 12 : dateStr.getHours();
    console.log( `formatted time:  ${dayOfWeek}, ${month} ${date}, ${year}, ${hrs}:${mins} ${meridiemSuffix}` );

    return `${dayOfWeek}, ${month} ${date}, ${year}, ${hrs}:${mins} ${meridiemSuffix}`

  } catch(error) {
    console.log(`Error formatting time:  ${error.message}`);
    return isoStringFormattedTime;
  }
}

export async function redisFetchEvent( eventId ) {
    const data = await redisClient.get(`event:data:${eventId}`);
    return data;
}
