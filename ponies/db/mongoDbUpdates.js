import {MongoClient} from 'mongodb';
import { mongoose } from 'mongoose';
import 'dotenv/config';
import User from '../models/user.js';

if( !process.argv[2] ) {
    console.error("USAGE:  node --env-file=../.env mongoDbUpdates.js dev|prod" );
    process.exit(1);
}

const pswd = process.argv[2] === 'dev' ? process.env.MONGODB_PASSWORD_DEV : process.env.MONGODB_PASSWORD;
const dbStr = process.argv[2] === 'dev' ? process.env.MONGODB_DB_STR_DEV : process.env.MONGODB_DB_STR;

const mongoDB = `mongodb+srv://${process.env.MONGODB_USERNAME}:${pswd}${dbStr}/${process.env.DB_NAME}`;
console.log(`mongodb url:  ${mongoDB}`)

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

async function main() {
    try {
        const connection = await mongoose.connect(mongoDB);
        console.log('Successfully connected to MongoDB.');
        await syncCollectionIndexes(connection, 'User')

    } catch(error) {
        console.error('Error creating user:', error.message);
    } finally {
        // Disconnect from the database when done
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
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

    console.log( `result:  ${JSON.stringify(result)}`);
    //process.exit(0);
}

main().catch((err) => console.log(err));
