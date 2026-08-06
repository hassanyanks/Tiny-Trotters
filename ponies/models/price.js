import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PriceSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  price: { type: String, required: true, minLength:  3, maxLength: 100, unique: false },
  event: { type: Schema.Types.ObjectId, ref: "Event", required: false },
  image: { type: String, required: true, minLength:  5, maxLength: 100 }
});

EventSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/event/${this._id}`;
});

// Export model
const Event = mongoose.model("Event", EventSchema);
export default Event;