import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ProductPriceSchema = new Schema({
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  eventCategory: { type: Schema.Types.ObjectId, ref: "EventCategory", required: true },
});

ProductPriceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/price/${this._id}`;
});

// Export model
const EventPrice = mongoose.model("EventPrice", ProductPriceSchema);
export default EventPrice;