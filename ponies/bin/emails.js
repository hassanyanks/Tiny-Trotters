import bcrypt from 'bcrypt';
import crypto, { hash } from 'crypto';
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

function send( mailOptions ) {
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent successfully!', info);
    }
  });
}

export async function emailDocument( documentBuffer, senderEmail, recipientsEmail ) {

  //let base64String = documentBuffer.base64data;
  //if( base64String.includes(',') ) {
    //base64String = base64String.split(',')[1];
  //}
  //const pdfBuffer = Buffer.from( base64String, 'base64' );

  const mailOptions = {
    from: senderEmail,
    to: recipientsEmail,
    cc: senderEmail,
    subject: 'Tiny Trotters Pony Parties Scheduled Event Signable Waiver Form',
    text: 'The sending customer has viewed the now signable attached waiver form.',
    attachment: [{ filename:  'signable_waiver.pdf', data:  documentBuffer }]
  };

  send( mailOptions );

}

function getLocalTime( isoStringFormattedTime ) {
    const localTime = new Date(isoStringFormattedTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Set to true for AM/PM format
    });
    return localTime;    
}

function getStyleSheet() {

return '.expander-content ' + 
'{ ' +
'  width: max-content;' +
'  padding: 20px;' +
'  flex-grow: 1;  ' +
'  overflow-y: auto;  ' +
'  -webkit-overflow-scrolling: touch; ' +
'}' +
'event-meta p ' + 
'{ ' +
'  margin: 8px 0; ' +
'  event-meta h3 { ' +
'  text-align: center; ' +
'  expander-fieldname { ' +
'  margin-right: 5px; ' +
'  font-weight: bold; ' +
'}' +
'.fields-parent-container ' + 
'{ ' +
'  flex: 1; ' +
'  min-width: 0; ' +
'  font-size: clamp(0.875rem, 1.2vw + 0.5rem, 1.25rem); ' +  
'  border: 1px solid rgba(0, 0, 0, 0.15); ' +
'  border-radius: 6px; ' +
'  background-color: #ffffff; ' +
'  margin: 20px; ' +
'}' +
'.expander-fieldname { ' +
'  margin-right: 5px; ' +
'  font-weight: bold; ' +
'}' +
'.styled-border ' +
'{ ' +
'  border: 2px solid #ccc; ' +
'  border-radius: 6px; ' +
'  box-sizing: border-box; ' +
'  padding: 5px; ' +
'} '

}

function formatFieldName(fieldName) {
    let tmp = fieldName.replace(/^(Event-)|(Your)|(Venue)|-/g, (m, p1) => p1 ? '' : ' ')
    return tmp.charAt(0).toUpperCase() + tmp.slice(1);;
}

function setDetails(title, details) {
  let detailsContent = `<h3 style="font-size: 20px;">${title}<hr><br>`;

  if(details) {
    if( title === 'Pony Details') {
      details.forEach((ponyAttributes,index) => {
        console.log(`pony attributes:  ${JSON.stringify(ponyAttributes)}`);
        for(const[key,value] of Object.entries(ponyAttributes).filter(([key]) => key !== '_id')) {
          console.log(`adding pony attribute to fieldsContent ${key}//${value}`);
          detailsContent += `<div><span class="expander-fieldname"; style="font-size: 16px; font-weight: bold;">${key.charAt(0).toUpperCase() + key.slice(1)}</span>:  ` +
                            `<span style="font-size: 16px; font-weight: light;">${value instanceof Array ? value.toString() : value}</span></div>`;
        }
        detailsContent += '<br>';                
      });
    } else {
      for(const[key,value] of Object.entries(details).filter(([key]) => key !== '_id')) {
          const fieldName = key;
          const fieldValue = value;
          detailsContent += `<div><span class="expander-fieldname" style="font-size: 16px; font-weight: bold;">${formatFieldName(fieldName)}</span>:  ` +
                            `<span style="font-size: 16px; font-weight: light;">${fieldName.includes('Start') || fieldName.includes('End') ? getLocalTime(fieldValue) : fieldValue}</span></div>`;
      }
    }
  }

  return detailsContent;
}

function setHtmlContent(redisEventParsed) {

  const eventDetails = redisEventParsed.eventDetails;
  const customerDetails = redisEventParsed.yourDetails;
  const venueDetails = redisEventParsed.venueDetails;
  const ponyDetails = redisEventParsed.ponies;
  const allDetails = [eventDetails, ponyDetails, customerDetails, venueDetails];
  const titles = ['Event Details', 'Pony Details', 'Customer Details', 'Venue Details'];
  let fieldsContent;

  allDetails.forEach((details, index) => {
    console.log(`adding this content to fieldsContent ${JSON.stringify(details)}`);
    fieldsContent += setDetails(titles[index], details);
  });

  const htmlContent = fieldsContent.replace('undefined<h3', '<h3'); //errant undefined of unknown origin
  console.log(`**********html content:  ${htmlContent}`);
  return htmlContent;
}

export async function sendEmailWithToken(user) {

  const SENDER_EMAIL = `${process.env.STAFF_EMAIL.split(',')[0]}`;
  const RECIPIENT_EMAIL = user.email;
  const resetUrl = `https://localhost:443/password-reset-form/?token=${user.resetPasswordToken}`;

  const mailOptions = {
    from: SENDER_EMAIL,
    to: RECIPIENT_EMAIL,
    subject: 'Tiny Trotters Pony Parties Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  };

  send( mailOptions );

}

export async function sendScheduledEventEmail( redisEventParsed ) {

  const SENDER_EMAIL = redisEventParsed.yourDetails['Your-Email'];
  const RECIPIENTS = `${process.env.STAFF_EMAIL}`;
  const htmlContent = setHtmlContent(redisEventParsed);

  const mailOptions = {
    from: SENDER_EMAIL,
    to: RECIPIENTS,
    cc: SENDER_EMAIL,
    subject: 'Tiny Trotters Pony Parties Schedule Event Completion',
    html: htmlContent,
  };

  send( mailOptions );

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

  
