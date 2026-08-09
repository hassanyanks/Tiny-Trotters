import { cachedCitiesStr } from '../utils/cityService.js';
import Picture from "../models/picture.js";

export const pictures = async(req, res, next) => {
    const pictures = await Picture.find().sort({name: 1});
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.pictures = pictures;
    res.render("gallery");
};

/*
async function getData(collection, filter) {
    const mongoDB = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.MONGODB_DB_STR}`;
    const client = new MongoClient(mongoDB);
    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const data = await db.collection(collection).find(filter).toArray();
        client.close();
        return data;
    } catch (err) {
        res.status(500).send('Error getting data');
    }
}

export const events = async(req, res, next) => {
    const allEvents = res ? await getData('events', {} ) : [];
    console.log(`allEvents:  ${allEvents}`)
    res.render("schedule_event", {
        events: allEvents
    });
};
*/