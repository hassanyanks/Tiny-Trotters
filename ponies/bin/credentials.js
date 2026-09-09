import bcrypt from 'bcrypt';
import crypto, { hash } from 'crypto';
import User from '../models/user.js';
//import {SALT_ROUNDS} from '../config/config.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { MailtrapClient } from 'mailtrap';
import path from 'path';

const __dirname = import.meta.dirname
dotenv.config({ path: path.join(__dirname, '../.env') });

export function updateUserWithToken( user, hashedToken ) {
  return new Promise( async (resolve, reject) => {
    console.log(`updateUserWithToken() user passed in:  user ${user}, token ${hashedToken}`)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 1800000; // .5 hour
      const modifiedUser = await user.save();
      if( modifiedUser.resetPasswordToken === hashedToken ) {
        resolve(modifiedUser);
      } else {
        reject(new Error(`Unable to update User record with reset token.`))
      }
  });
}
  
