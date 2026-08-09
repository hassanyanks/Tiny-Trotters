import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import bcrypt from 'bcrypt';
//import {SALT_ROUNDS} from '../config/config.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 

const UserSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, minLength:  5, maxLength: 128, unique: false },
    streetAddress: { type: String, required: true, minLength:  10, maxLength: 256, unique: false },
    phone: { type: String, required: true, minLength:  12, maxLength: 32, unique: true },
    email: { type: String, required: true, minLength:  32, maxLength: 128, unique: true },
    cityAddress: { type: Schema.Types.ObjectId, ref: "CityAddress", required: false },
    password: String,
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // For OAuth2
    provider: String,
    providerId: String,
    // ... other profile info (name, etc)
}).pre('save', async function(err) {
    //const saltRounds = 10;
    if(!this.isModified('password')) return err;
    try {
        const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS);
        this.password = bcrypt.hash(this.password, salt);
    } catch(err) {
        console.error(err);
    }
}).plugin(passportLocalMongoose.default, {
    usernameField: 'email',
    passwordField: 'password'
});

const User = mongoose.model("User", UserSchema);
export default User;
