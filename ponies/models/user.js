import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' }); 
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    role: String,
    name: { type: String, maxLength: 128 },
    streetAddress: { type: String, maxLength: 256 },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, maxLength: 128, unique: true },
    cityAddress: { type: Schema.Types.ObjectId, ref: 'CityAddress' },

    password: String,
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // For OAuth2
    provider: String,
    providerId: String
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
