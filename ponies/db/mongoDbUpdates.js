import dotenv from 'dotenv';
import path from 'path';
import {MongoClient} from 'mongodb';
import User from '../models/user.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

if( !process.argv[2] ) {
    console.error("USAGE:  node --env-file=../.env populateDb.mjs dev|prod" );
    process.exit(1);
}
if( process.argv[2] !== 'prod' && process.argv[2] !== 'dev' ) {
    console.error("USAGE:  environment must be one of these:  dev|prod" );
    process.exit(1);
}

const pswd = process.argv[2] === 'dev' ? process.env.MONGODB_PASSWORD_DEV : process.env.MONGODB_PASSWORD;
const dbStr = process.argv[2] === 'dev' ? process.env.MONGODB_DB_STR_DEV : process.env.MONGODB_DB_STR;
console.log(`nodeEnv:  ${process.argv[2]}, pswd: ${process.env.MONGODB_PASSWORD_DEV}, db str:  ${process.env.MONGODB_DB_STR_DEV}`);

const mongoURL = `mongodb+srv://${process.env.MONGODB_USERNAME}:${pswd}${dbStr}`;
console.log(`mongodb url:  ${mongoURL}`)

main(mongoURL).catch((err) => console.log(err));

async function createUser() {
    const newUser = new User({
        email: 'fakeUser@gmail.com',
        role: 'user',
        streetAddress: 'streetAddress',
        phone: '123-4567',
        password: '',
        salt: '',
        resetPasswordToken: '',
        resetPasswordExpires: '',
        // For OAuth2
        provider: '',
        providerId: '',
    });

    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser);        
    return savedUser;
}

async function syncCollectionIndexes(connection, modelName) {
    try {
        // Retrieve the registered Mongoose model
        const Model = connection.model(modelName);

        console.log(`Syncing indexes for model: ${modelName}...`);

        // 1. Drop indexes that are in the DB but NOT defined in your Mongoose schema
        await Model.cleanIndexes();

        // 2. Build any indexes defined in your schema that are missing in the DB
        await Model.createIndexes();

        console.log(`Successfully synced indexes for ${modelName}.`);
        return true;
    } catch (error) {
        console.error(`Error syncing indexes for ${modelName}:`, error);
        throw error;
    }
}

async function setPrices(collection) {

    let birthdayAndHoliday = 750.00;
    let gardenAndDerby = 850.00;
    let weddingAndQuince = 950.00;

    let servicesAndBasePrices = { "Anniversary": weddingAndQuince,
                                    "Birthday": birthdayAndHoliday,
                                    "Christmas": birthdayAndHoliday,
                                    "Easter": birthdayAndHoliday,
                                    "Garden Party": gardenAndDerby,
                                    "Graduation": birthdayAndHoliday,
                                    "Halloween": birthdayAndHoliday,
                                    "July 4th": birthdayAndHoliday,
                                    "Photo Shoot": gardenAndDerby,
                                    "Quinceañera": weddingAndQuince,
                                    "St. Patricks": birthdayAndHoliday,
                                    "Wedding": weddingAndQuince
    }

    const bulkOperations = Object.entries(servicesAndBasePrices).map(([eventType, price]) => ({
        updateOne: {
            filter: { name: eventType },
            update: { $set: { price } },
            upsert: false
        }
    }));

    if (bulkOperations.length > 0) {
        const result = await collection.bulkWrite(bulkOperations);
        console.log(`Successfully updated ${result.modifiedCount} event prices.`);
    }

}

async function main(mongoURL) {
    try {
        const client = new MongoClient(mongoURL);
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const eventCategoriesCollection = db.collection('eventcategories');
        const eventPricesCollection = db.collection('eventprices');
        const eventTypesCollection = db.collection('eventtypes');
        await setPrices(collection); 
    } catch(error) {
        console.error('Error in main:', error.message);
    } finally {
        process.exit(0);
  }

/*
    const client = new MongoClient(mongoDB);
    await client.connect(mongoDB);
    console.log("Debug: Should be connected?");
    console.log("hydrating DB...");
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');
    const result = await userCreate(usersCollection, 0, 'user', 'test user', '', '', 'testUser@gmail.com', '', '', '', '', '', '', '');
*/
    //  USED TO ADD A FIELD
    //const result = await usersCollection.updateMany(
    //    { role: { $exists: false } }, // Filter: missing the 'status' field
    //    { $set: { role: "user" } }   // Action: set default value
    //)

    //console.log( `result:  ${JSON.stringify(result)}`);
    //process.exit(0);
}

