import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PriceTypeSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, minLength:  3, maxLength: 100, unique: true },
});

PriceTypeSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/price-type/${this._id}`;
});

// Export model
const PriceType = mongoose.model("PriceType", PriceTypeSchema);
export default PriceType;