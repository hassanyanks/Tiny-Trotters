#! /usr/bin/env node
import {MongoClient} from 'mongodb';
import Event from "../models/event.js";
import 'dotenv/config';

const Events = [];

const mongoDB = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.MONGODB_DB_STR}`;
console.log(`mongodb url:  ${mongoDB}`)
main().catch((err) => console.log(err));

async function main() {
    const client = new MongoClient(mongoDB);
    await client.connect(mongoDB);
    console.log("Debug: Should be connected?");
    console.log("hydrating DB...");
    const db = client.db(process.env.DB_NAME);
    const eventsCollection = db.collection('events');
    await createEvents(eventsCollection);
    const accessoriesCollection = db.collection('accessories');
    await createAccessories(accessoriesCollection);
    console.log("Debug: Closing mongoose");
    client.close();
}

async function createEvents(collection) {
  console.log(`Adding events`);
  const nWithTilde = "\u00F1"; // ñ
  await Promise.all([
    eventCreate(collection, 0, "Wedding", null),
    eventCreate(collection, 1, "Anniversary", null),
    eventCreate(collection, 2, "Birthday", null),
    eventCreate(collection, 3, `Quincea${nWithTilde}era`, null),
    eventCreate(collection, 4, "Garden Party", null),
    eventCreate(collection, 5, "Christmas", null),
    eventCreate(collection, 6, "Easter", null),
    eventCreate(collection, 7, "July 4th", null),
    eventCreate(collection, 8, "St. Patricks", null),
    eventCreate(collection, 9, "Halloween", null),
    eventCreate(collection, 10, "Graduation", null),
    eventCreate(collection, 11, "Other", null),
  ]);
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

async function eventCreate( collection, id, name, image ) {
    const updatedEvent = await collection.findOneAndUpdate(
        {id, name, image},
        { $setOnInsert: 
            {
                id,
                name,
                image,
            }
         },
        { upsert: true, returnNewDocument: true }
    );
}

async function accessoryCreate( collection, id, name, image ) {
    const updatedEvent = await collection.findOneAndUpdate(
        {id, name, image},
        { $setOnInsert: 
            {
                id,
                name,
                image,
            }
         },
        { upsert: true, returnNewDocument: true }
    );
}
