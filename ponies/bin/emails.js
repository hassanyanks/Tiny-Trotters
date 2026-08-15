//import bcrypt from 'bcrypt';
//import crypto, { hash } from 'crypto';
//import User from '../models/user.js';
//import {SALT_ROUNDS} from '../config/config.js';
import 'dotenv/config';
import dotenv from 'dotenv';
import { MailtrapClient } from 'mailtrap'; //for dev purposes only
import path from 'path';
import fs from 'fs';
import pug from 'pug';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

// Configure Mailgun transport
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const transporter = nodemailer.createTransport(mg(auth));

const __dirname = import.meta.dirname
dotenv.config({ path: path.join(__dirname, '../.env') });

export async function sendScheduledEventEmail( email, eventDetails, accessories, locals ) {

  const TOKEN = process.env.MAILTRAP_TOKEN;
  const TEST_INBOX_ID = process.env.MAILTRAP_INBOX_ID;
  const SENDER_EMAIL = email;
  const RECIPIENTS = `${process.env.STAFF_EMAIL}`;
  const templatePath = path.join('.', 'views', 'scheduled_event.pug');
  const compiledFunction = pug.compileFile(templatePath);
  const htmlContent = compiledFunction(locals);

  const mailOptions = {
    from: SENDER_EMAIL,
    to: RECIPIENTS,
    cc: SENDER_EMAIL,
    subject: 'Tiny Trotters Pony Parties Schedule Event Completion',
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent successfully!', info);
    }
  });

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
  
