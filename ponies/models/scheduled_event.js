import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ScheduledEventSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  date: { type: String, required: true, minLength:  20, maxLength: 100, unique: false },
  eventAccessories: { type: Schema.Types.ObjectId, ref: "PonyEventAccessory", required: true },
  customer: { type: Schema.Types.ObjectId, ref: "CustomerAccount", required: true },
});

// Virtual for product sample URL
ScheduledEventSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/scheduledevent/${this._id}`;
});

// Export model
const ScheduledEvent = mongoose.model("ScheduledEvent", ScheduledEventSchema);
export default ScheduledEvent;