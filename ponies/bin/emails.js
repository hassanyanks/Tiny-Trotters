//import bcrypt from 'bcrypt';
//import crypto, { hash } from 'crypto';
//import User from '../models/user.js';
//import {SALT_ROUNDS} from '../config/config.js';
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
import { MailtrapClient } from 'mailtrap';
import path from 'path';
import fs from 'fs';
import pug from 'pug';

const __dirname = import.meta.dirname
dotenv.config({ path: path.join(__dirname, '../.env') });

export async function sendScheduledEventEmail( email, eventDetails, accessories ) {

  const TOKEN = process.env.MAILTRAP_TOKEN;
  const TEST_INBOX_ID = process.env.MAILTRAP_INBOX_ID;
  const SENDER_EMAIL = "support@gmail.com";
  const RECIPIENT_EMAIL = email;
  const htmlPath = path.join('.', 'views', 'scheduled_event.pug');
  const compiledFunction = pug.compileFile(htmlPath);

  //property names here must match those used by route controller
  const htmlContent = compiledFunction( {
    eventDetails: eventDetails,
    ponyAccessories: accessories
  }

  );
  const client = new MailtrapClient({ token: TOKEN, sandbox: true, testInboxId: TEST_INBOX_ID });

  client.send({
  from: { name: "Pony Event Customer", email: SENDER_EMAIL },
  to: [{ email: RECIPIENT_EMAIL }],
  subject: "Pony Event Scheduled",
  html: htmlContent,
  })
  .then(console.log)
  .catch(console.error); 

  /*
  const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const pug = require('pug');
const path = require('path');

// Configure Mailgun transport
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const transporter = nodemailer.createTransport(mg(auth));

// Compile Pug file with dynamic data variables
const htmlContent = pug.renderFile(path.join(__dirname, 'email.pug'), {
  name: 'Alice'
});

// Setup mail options
const mailOptions = {
  from: 'you@yourdomain.com',
  to: 'recipient@example.com',
  subject: 'Hello from Pug and Mailgun!',
  html: htmlContent
};

// Send the email
transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Response:', info);
  }
});
*/

}

export function sendEmailWithToken(user) {

  // Looking to send emails in production? Check out our Email API/SMTP product!
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.ESP_USER,
      pass: process.env.ESP_PSWD
    }
  });

  const TOKEN = process.env.MAILTRAP_TOKEN;
  const TEST_INBOX_ID = process.env.MAILTRAP_INBOX_ID;
  const SENDER_EMAIL = "support@gmail.com";
  const RECIPIENT_EMAIL = user.email;
  //const resetUrl = `https://localhost:443/pswd-reset-usermatch/?token=${user.resetPasswordToken}`;

  const client = new MailtrapClient({ token: TOKEN, sandbox: true, testInboxId: TEST_INBOX_ID });

  client.send({
  from: { name: "Mailtrap Test", email: SENDER_EMAIL },
  to: [{ email: RECIPIENT_EMAIL }],
  subject: "Scheduled Event",
  html: `${htmlContent}`,
  })
  .then(console.log)
  .catch(console.error);

}

export function generateHashedToken( user ) {
  return new Promise(async (resolve, reject)  => {
    // 1. Generate a raw random token for the email link
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash that token before saving it to the database
    const saltRounds = Number(process.env.SALT_ROUNDS);
    console.log(`*********************salt rounds is ${saltRounds}**************************`)
    const hashedToken = await bcrypt.hash(rawToken, saltRounds);
    console.log(`*********************generateHashedToken() user is ${user}**************************`)
    console.log(`*********************generateHashedToken() hashed token is ${hashedToken}**************************`)
    if( hashedToken) {
      //const returnValue = { user, hashedToken };
      resolve(hashedToken);
    } else {
        reject(new Error(`Could not generate hashed token.`));
    }
  }) 
}

export function getUserByEmail( resolve, reject, email ) {
  console.log(`getUserByEmail() user email is ${email}`)
  User.findOne({ email: email })
    .then((user) => {
      if(user) {
        resolve(user);
      } else {
        reject(new Error(`We did not find email '${email}' that you entered.`))
      } 

    })
}

export function updateUserWithToken( user, hashedToken ) {
  return new Promise( async (resolve, reject) => {
    console.log(`updateUserWithToken() user passed in:  user ${user}, token ${hashedToken}`)
    //const { user, hashedToken } = userAndToken;
      //console.log(`********************* mailtrap user ${process.env.ESP_USER}, mailtrap pswd ${process.env.ESP_PSWD}**************************`)
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
  
