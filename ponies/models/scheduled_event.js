import mongoose from 'mongoose';
import Pony from './pony.js';
import User from './user.js';
import EventType from './event_type.js';

const Schema = mongoose.Schema;

const EventDetailsSchema = new Schema({
  'Event-Location': { 
    type: String, 
    required: true 
  },
  'Event-Start': { 
    type: Date, 
    required: true 
  },
  'Event-End': { 
    type: Date, 
    required: true 
  },
  'Event-Type': { 
    type: String, 
    required: true 
  },
  'Event-Theme': { 
    type: String, 
    required: true 
  },
  'Event-Color-Scheme': { 
    type: String, 
    required: true 
  },
}, { _id: false }); // '_id: false' prevents MongoDB from generating a separate ID for this sub-object

const YourDetailsSchema = new Schema({
  'Your-Name': { 
    type: String, 
    required: true 
  },
  'Your-Street-Address': { 
    type: String, 
    required: true 
  },
  'Your-Zipcode': { 
    type: String, 
    required: true 
  },
  'Your-Phone': { 
    type: String, 
    required: true 
  },
  'Your-Email': { 
    type: String, 
    required: true 
  },
  'Your-Active-Military/Veteran': { 
    type: String, 
    required: true 
  },
}, { _id: false }); // '_id: false' prevents MongoDB from generating a separate ID for this sub-object

const VenueDetailsSchema = new Schema({
  'Venue-Name': { 
    type: String, 
    required: false 
  },
  'Venue-Street-Address': { 
    type: String, 
    required: false 
  },
  'Venue-Zipcode': { 
    type: String, 
    required: false 
  },
  'Venue-Phone': { 
    type: String, 
    required: false 
  },
}, { _id: false }); // '_id: false' prevents MongoDB from generating a separate ID for this sub-object


const PonyEventSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  accessories: [String],
});

// 3. Parent Document Schema (Scheduled Event)
const ScheduledEventSchema = new Schema({
  eventDetails: EventDetailsSchema,
  yourDetails: YourDetailsSchema,
  venueDetails: VenueDetailsSchema,
  ponies: [PonyEventSchema], // Array of nested pony sub-documents
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  waiverForm: { 
    type: Buffer 
  }
}, { timestamps: true ,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

// The compound index works cleanly here
ScheduledEventSchema.index({ 'details.event.Event-Start': 1 });
ScheduledEventSchema.index({ 'ponies.name': 1 },{ 'ponies.role': 1 },{ 'ponies.accessories': 1 });

/*
ScheduledEventSchema.virtual('formattedStart').get(function() {
  return formatDate(this.details?.event?.['Event-Start']);
});

ScheduledEventSchema.virtual('formattedEnd').get(function() {
  return formatDate(this.details?.event?.['Event-End']);
});
*/

// Export models
export const PonyEvent = mongoose.model("PonyEvent", PonyEventSchema);
export const EventDetails = mongoose.model("EventDetails", EventDetailsSchema);
const ScheduledEvent = mongoose.model("ScheduledEvent", ScheduledEventSchema);
export default ScheduledEvent;

/*
// 2. Define the wrapper object schema
const DetailsSchema = new Schema({
  event: { 
    type: EventDetailsSchema, 
    required: true 
  }
}, { _id: false });
*/

/*

// 3. Define your main Main Schema
const ScheduledEventSchema = new Schema({
  details: { 
    type: EventDetailsSchema, // Enforces the strict subdocument structure
    required: true 
  },
  ponies: [PonyEventData],
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  waiverForm: { 
    type: Buffer 
  }
}, { 
  timestamps: true, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

const PonySchema = new Schema({
  name: { type: String, required: true, minLength:  3, maxLength: 100, unique: true },
  image: { type: [String], required: true, minLength:  5, maxLength: 100 }
});

const PonyEventDetailsSchema = new Schema({
  details: {
  }
  accessories: { type: [String], required: true },
  roles: 
});

const PonyEventSchema = new Schema({

});
*/

