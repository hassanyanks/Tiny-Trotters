#! /usr/bin/env node
import {MongoClient} from 'mongodb';
import 'dotenv/config';

var ponies = [];
var accessories = [];
var eventTypes = [];
var scheduledEvents = [];
const states = [];

const mongoDB = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.MONGODB_DB_STR}`;
console.log(`mongodb url:  ${mongoDB}`)
main().catch((err) => console.log(err));

async function main() {
    const client = new MongoClient(mongoDB);
    await client.connect(mongoDB);
    console.log("Debug: Should be connected?");
    console.log("hydrating DB...");
    const db = client.db(process.env.DB_NAME);
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
    console.log("Debug: Closing MongoClient");
    client.close();
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
}

async function createCityAddresses(collection) {
  console.log(`Adding city addresses`);
  await Promise.all([
    cityAddressCreate(collection, 0, "93230", 0, states[0]), //only state is CA at this writing
    cityAddressCreate(collection, 1, "93232", 0, states[0]),
    cityAddressCreate(collection, 2, "93286", 1, states[0]),
    cityAddressCreate(collection, 3, "93662", 2, states[0]),
    cityAddressCreate(collection, 4, "93247", 3, states[0]),
    cityAddressCreate(collection, 5, "93274", 4, states[0]),
    cityAddressCreate(collection, 6, "93275", 4, states[0]),
    cityAddressCreate(collection, 7, "93277", 5, states[0]),
    cityAddressCreate(collection, 8, "93278", 5, states[0]),
    cityAddressCreate(collection, 9, "93279", 5, states[0]),
    cityAddressCreate(collection, 10, "93290", 5, states[0]),
    cityAddressCreate(collection, 11, "93291", 5, states[0]),
    cityAddressCreate(collection, 12, "93292", 5, states[0]),
    cityAddressCreate(collection, 13, "93611", 7, states[0]),
    cityAddressCreate(collection, 14, "93612", 7, states[0]),
    cityAddressCreate(collection, 15, "93613", 7, states[0]),
    cityAddressCreate(collection, 16, "93619", 7, states[0]),
    cityAddressCreate(collection, 17, "93245", 8, states[0]),
    cityAddressCreate(collection, 18, "93246", 8, states[0]),
    cityAddressCreate(collection, 19, "93701", 6, states[0]),
    cityAddressCreate(collection, 20, "93702", 6, states[0]),
    cityAddressCreate(collection, 21, "93703", 6, states[0]),
    cityAddressCreate(collection, 22, "93704", 6, states[0]),
    cityAddressCreate(collection, 23, "93705", 6, states[0]),
    cityAddressCreate(collection, 24, "93706", 6, states[0]),
    cityAddressCreate(collection, 25, "93707", 6, states[0]),
    cityAddressCreate(collection, 26, "93708", 6, states[0]),
    cityAddressCreate(collection, 27, "93709", 6, states[0]),
    cityAddressCreate(collection, 28, "93710", 6, states[0]),
    cityAddressCreate(collection, 29, "93711", 6, states[0]),
    cityAddressCreate(collection, 30, "93712", 6, states[0]),
    cityAddressCreate(collection, 31, "93720", 6, states[0]),
    cityAddressCreate(collection, 32, "93721", 6, states[0]),
    cityAddressCreate(collection, 33, "93722", 6, states[0]),
    cityAddressCreate(collection, 34, "93723", 6, states[0]),
    cityAddressCreate(collection, 35, "93724", 6, states[0]),
    cityAddressCreate(collection, 36, "93725", 6, states[0]),
    cityAddressCreate(collection, 37, "93726", 6, states[0]),
    cityAddressCreate(collection, 38, "93727", 6, states[0]),
    cityAddressCreate(collection, 39, "93728", 6, states[0]),
    cityAddressCreate(collection, 40, "93730", 6, states[0]),
    cityAddressCreate(collection, 41, "93737", 6, states[0])
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
