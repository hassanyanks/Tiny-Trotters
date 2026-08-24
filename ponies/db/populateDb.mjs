#! /usr/bin/env node
import {MongoClient} from 'mongodb';
import 'dotenv/config';
import ScheduledEvent from '../models/scheduled_event.js';

var ponies = [];
var accessories = [];
var eventTypes = [];
var scheduledEvents = [];
var states = [];
var cities = [];

const mongoDB = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.MONGODB_DB_STR}`;
console.log(`mongodb url:  ${mongoDB}`)
main().catch((err) => console.log(err));

async function main() {
    const client = new MongoClient(mongoDB);
    await client.connect(mongoDB);
    console.log("Debug: Should be connected?");
    console.log("hydrating DB...");
    const db = client.db(process.env.DB_NAME);
/*
    const eventTypesCollection = db.collection('eventtypes');
    await createEventTypes(eventTypesCollection);
    const poniesCollection = db.collection('ponies');
    await createPonies(poniesCollection);
    const accessoriesCollection = db.collection('ponyeventaccessories');
    await createAccessories(accessoriesCollection);
    const statesCollection = db.collection('states');
    await createStates(statesCollection);
    const citiesCollection = db.collection('cities');
    await createCities(citiesCollection);
    const cityAddressesCollection = db.collection('cityaddresses');
    await createCityAddresses(cityAddressesCollection);
    const picturesCollection = db.collection('pictures');
    await createPictures(picturesCollection);
    const usersCollection = db.collection('users');
    await createUsers(usersCollection);
*/
    const scheduledEventsCollection = db.collection('scheduledevents');
    await insertScheduledEvent(scheduledEventsCollection);
    console.log("Debug: Closing MongoClient");
    client.close();
}

async function insertScheduledEvent(collection) {
  try {
    // Construct data respecting the nested structures and hyphenated keys
    const eventData = {
      details: { 'Event-Type': 'Birthday' },
      ponies: [
        {
          name: "Starlight",
          role: "Grand Marshal",
          accessories: ["Golden Tiara", "Silk Cape"]
        },
        {
          name: "Buttercup",
          role: "Banner Bearer",
          accessories: ["Golden Tiara", "Silk Cape"]
        }
      ]
      // Optional: Replace with a real user ID string if available
      //customer: new mongoose.Types.ObjectId(), 
      // Optional: Store binary data like a PDF or text signature
      //waiverForm: Buffer.from("Sample waiver signature confirmation") 
    };

    // Insert into database
    const savedEvent = await collection.insertOne(eventData);
    
    console.log("Successfully inserted document:");
    console.log(JSON.stringify(savedEvent, null, 2));
    return savedEvent;
  } catch (error) {
    console.error("Insertion failed:", error.message);
  }
}

/*
async function createScheduledEvents(collection) {
  console.log(`Adding scheduled events`);
  const today11am = new Date();
  today11am.setHours(11,0,0,0)
  const today12am = new Date();
  today12am.setHours(12,0,0,0)
  const today1pm = new Date();
  today1pm.setHours(13,0,0,0)
  const today3pm = new Date();
  today3pm.setHours(15,0,0,0)
  const today4pm = new Date();
  today4pm.setHours(16,0,0,0)
  const today5pm = new Date();
  today5pm.setHours(17,0,0,0)
  await Promise.all([
    scheduledEventCreate(collection, 1, {}),
    //scheduledEventCreate(collection, 1, today1pm, today3pm, 'America/Chicago', 'Birthday', 'my street address', 'my zip'),
    //scheduledEventCreate(collection, 2, today4pm, today5pm, 'America/Chicago', 'Baby Shower', 'my street address', 'my zip'),
  ]);
}

async function scheduledEventCreate( collection, _id, details) {
    const updatedScheduledEvent = await collection.findOneAndUpdate(
        { _id: _id},
        { $set: 
            {
                details,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}
*/
/*
async function createUsers(collection) {
  console.log(`Adding users`);
 await Promise.all([
    userCreate(collection, 0, ),
  ]);
}

async function userCreate( collection, _id, start, end, timeZone, type, streetAddress, city, state, zipcode ) {
    const updatedUser = await collection.findOneAndUpdate(
        {_id: _id},
        { $set: 
            {
                start, end, timeZone, type, streetAddress, city, state, zipcode,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}


async function createEventTypes(collection) {
  console.log(`Adding event types`);
  const nWithTilde = "\u00F1"; // ñ
  await Promise.all([
    eventTypeCreate(collection, 0, "Wedding", null),
    eventTypeCreate(collection, 1, "Anniversary", null),
    eventTypeCreate(collection, 2, "Birthday", null),
    eventTypeCreate(collection, 3, `Quincea${nWithTilde}era`, null),
    eventTypeCreate(collection, 4, "Garden Party", null),
    eventTypeCreate(collection, 5, "Christmas", null),
    eventTypeCreate(collection, 6, "Easter", null),
    eventTypeCreate(collection, 7, "July 4th", null),
    eventTypeCreate(collection, 8, "St. Patricks", null),
    eventTypeCreate(collection, 9, "Halloween", null),
    eventTypeCreate(collection, 10, "Graduation", null),
    eventTypeCreate(collection, 11, "Other", null),
    eventTypeCreate(collection, 12, "Photo Shoot", null),
    eventTypeCreate(collection, 13, "Pony Ride (65 lbs limit)", null),
  ]);
}

async function eventTypeCreate( collection, id, name, image ) {
    const updatedEventType = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                name,
                image,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}

async function createPonies(collection) {
  console.log(`Adding ponies`);
  await Promise.all([
    ponyCreate(collection, 0, "Rooster", ['Rooster.png','rooster_in_stable.jpg']),
    ponyCreate(collection, 1, "Prince", ['Prince.png','prince_in_stable.jpg']),
  ]);
}

async function ponyCreate( collection, id, name, image ) {
    const updatedPony = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                name,
                image,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}

async function createAccessories(collection) {
  console.log(`Adding accessories`);
  await Promise.all([
    accessoryCreate(collection, 0, "Sparkles", null),
    accessoryCreate(collection, 1, "Unicorn Horn", null),
    accessoryCreate(collection, 2, "Garland", null),
    accessoryCreate(collection, 3, "Flower Crown", null),
    accessoryCreate(collection, 4, "Flower Clips", null),
    accessoryCreate(collection, 5, "Hair Tinsel", null),
    accessoryCreate(collection, 6, "Butterfly Clips", null),
    accessoryCreate(collection, 7, "Pearls", null),
    accessoryCreate(collection, 8, "Gems/Crystals & Color", null),
    accessoryCreate(collection, 9, "Other", null),
  ]);
}

async function accessoryCreate( collection, id, name, image ) {
    const updatedAccessory = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                name,
                image,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}

async function createStates(collection) {
  console.log(`Adding states`);
  await Promise.all([
    stateCreate(collection, 0, "CA", null),
  ]);
}

async function stateCreate( collection, id, name, image ) {

    const updatedState = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                name,
                image,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
    states[id] = updatedState; //producing duplicates because on CA is in db at this writing
} 

async function createCities(collection) {
  console.log(`Adding cities`);
  await Promise.all([
    cityCreate(collection, 0, "Hanford", states[0]), //states[0] only used here because only CA is in db at this writing
    cityCreate(collection, 1, "Woodlake", states[0]),
    cityCreate(collection, 2, "Selma", states[0]),
    cityCreate(collection, 3, "Lindsay", states[0]),
    cityCreate(collection, 4, "Tulare", states[0]),
    cityCreate(collection, 5, "Visalia", states[0]),
    cityCreate(collection, 6, "Fresno", states[0]),
    cityCreate(collection, 7, "Clovis", states[0]),
    cityCreate(collection, 8, "Lemoore", states[0]),
  ]);
}

async function cityCreate( collection, id, name, stateId ) {
    const updatedCity = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                name,
                stateId,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
    cities[id] = updatedCity;
}

async function createCityAddresses(collection) {
  console.log(`Adding city addresses`);
  await Promise.all([
    cityAddressCreate(collection, 0, "93230", cities[0], states[0]), //only state is CA at this writing
    cityAddressCreate(collection, 1, "93232", cities[0], states[0]),
    cityAddressCreate(collection, 2, "93286", cities[1], states[0]),
    cityAddressCreate(collection, 3, "93662", cities[2], states[0]),
    cityAddressCreate(collection, 4, "93247", cities[3], states[0]),
    cityAddressCreate(collection, 5, "93274", cities[4], states[0]),
    cityAddressCreate(collection, 6, "93275", cities[4], states[0]),
    cityAddressCreate(collection, 7, "93277", cities[5], states[0]),
    cityAddressCreate(collection, 8, "93278", cities[5], states[0]),
    cityAddressCreate(collection, 9, "93279", cities[5], states[0]),
    cityAddressCreate(collection, 10, "93290", cities[5], states[0]),
    cityAddressCreate(collection, 11, "93291", cities[5], states[0]),
    cityAddressCreate(collection, 12, "93292", cities[5], states[0]),
    cityAddressCreate(collection, 13, "93611", cities[7], states[0]),
    cityAddressCreate(collection, 14, "93612", cities[7], states[0]),
    cityAddressCreate(collection, 15, "93613", cities[7], states[0]),
    cityAddressCreate(collection, 16, "93619", cities[7], states[0]),
    cityAddressCreate(collection, 17, "93245", cities[8], states[0]),
    cityAddressCreate(collection, 18, "93246", cities[8], states[0]),
    cityAddressCreate(collection, 19, "93701", cities[6], states[0]),
    cityAddressCreate(collection, 20, "93702", cities[6], states[0]),
    cityAddressCreate(collection, 21, "93703", cities[6], states[0]),
    cityAddressCreate(collection, 22, "93704", cities[6], states[0]),
    cityAddressCreate(collection, 23, "93705", cities[6], states[0]),
    cityAddressCreate(collection, 24, "93706", cities[6], states[0]),
    cityAddressCreate(collection, 25, "93707", cities[6], states[0]),
    cityAddressCreate(collection, 26, "93708", cities[6], states[0]),
    cityAddressCreate(collection, 27, "93709", cities[6], states[0]),
    cityAddressCreate(collection, 28, "93710", cities[6], states[0]),
    cityAddressCreate(collection, 29, "93711", cities[6], states[0]),
    cityAddressCreate(collection, 30, "93712", cities[6], states[0]),
    cityAddressCreate(collection, 31, "93720", cities[6], states[0]),
    cityAddressCreate(collection, 32, "93721", cities[6], states[0]),
    cityAddressCreate(collection, 33, "93722", cities[6], states[0]),
    cityAddressCreate(collection, 34, "93723", cities[6], states[0]),
    cityAddressCreate(collection, 35, "93724", cities[6], states[0]),
    cityAddressCreate(collection, 36, "93725", cities[6], states[0]),
    cityAddressCreate(collection, 37, "93726", cities[6], states[0]),
    cityAddressCreate(collection, 38, "93727", cities[6], states[0]),
    cityAddressCreate(collection, 39, "93728", cities[6], states[0]),
    cityAddressCreate(collection, 40, "93730", cities[6], states[0]),
    cityAddressCreate(collection, 41, "93737", cities[6], states[0])
  ]);
}

async function cityAddressCreate( collection, id, zipcode, cityId, stateId ) {
    const updatedCityAddress = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                zipcode,
                cityId,
                stateId
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}

async function createPictures(collection) {
  console.log(`Adding pictures`);
  await Promise.all([
    pictureCreate(collection, 0,  "439407925_448573734204982_3115424238644106809_n.jpg"),
    pictureCreate(collection, 1,  "479985470_640282978367389_339806539255933511_n.jpg"),
    pictureCreate(collection, 2,  "480096960_640282935034060_8712245199628960267_n.jpg"),
    pictureCreate(collection, 3,  "480143225_640282991700721_5457467526343740744_n.jpg"),
    pictureCreate(collection, 4,  "480176804_640283221700698_4075559026557796023_n.jpg"),
    pictureCreate(collection, 5,  "480186333_640282838367403_8338674347385113768_n.jpg"),
    pictureCreate(collection, 6,  "480203321_640282881700732_7359795667768359503_n.jpg"),
    pictureCreate(collection, 7,  "480216794_640283195034034_1670901924572802952_n.jpg"),
    pictureCreate(collection, 8,  "480224268_640282845034069_8296545968636651848_n.jpg"),
    pictureCreate(collection, 9,  "480227897_640283211700699_1688479097845466772_n.jpg"),
    pictureCreate(collection, 10, "480235645_640283275034026_5842160482480638635_n.jpg"),
    pictureCreate(collection, 11, "480245082_640283228367364_5807529775488344017_n.jpg"),
    pictureCreate(collection, 12, "480246450_640282998367387_1339037549850701847_n.jpg"),
    pictureCreate(collection, 13, "480257481_640283201700700_9222061096293718710_n.jpg"),
    pictureCreate(collection, 14, "480265003_640282961700724_7763331580501445692_n.jpg"),
    pictureCreate(collection, 15, "480267307_640282965034057_1192654947709564250_n.jpg"),
    pictureCreate(collection, 16, "480268149_640282908367396_1377743264312676737_n.jpg"),
    pictureCreate(collection, 17, "480294136_640282958367391_450127297654827567_n.jpg"),
    pictureCreate(collection, 18, "480300621_640283245034029_3446962416516117818_n.jpg"),
    pictureCreate(collection, 19, "480303808_640282925034061_7261607365390556251_n.jpg"),
    pictureCreate(collection, 20, "480308395_640283198367367_732948350489255281_n.jpg"),
    pictureCreate(collection, 21, "480332245_640282911700729_6273435432003905124_n.jpg"),
    pictureCreate(collection, 22, "480436370_640282948367392_983983383008453716_n.jpg"),
    pictureCreate(collection, 23, "480551934_640282895034064_4961069943548715204_n.jpg"),
    pictureCreate(collection, 24, "480558030_640283268367360_395762167447618808_n.jpg"),
    pictureCreate(collection, 25, "prince_in_stable.jpg"),
    pictureCreate(collection, 26, "rooster_in_stable.jpg"),
    pictureCreate(collection, 27, "742020374_1031753579220325_3780952901091891710_n.jpg"),
    pictureCreate(collection, 28, "746909373_1037222842006732_4355158734739058564_n.jpg"),
    pictureCreate(collection, 29, "747653178_1034136365648713_7598095087113839530_n.jpg"),
    pictureCreate(collection, 30, "753241677_1044110914651258_2223625895112956405_n.jpg"),
    pictureCreate(collection, 31, "754462910_1044110881317928_7751548235702211092_n.jpg"),
    pictureCreate(collection, 32, "756525525_1044110937984589_2952812491079601121_n.jpg")
  ]);
}

async function pictureCreate( collection, id, image ) {
    const updatedPicture = await collection.findOneAndUpdate(
        {id},
        { $set: 
            {
                id,
                image,
            }
         },
        { upsert: true, returnDocument: 'after' }
    );
}
*/