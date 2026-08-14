import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PonySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, minLength:  3, maxLength: 100, unique: true },
  image: { type: [String], required: true, minLength:  5, maxLength: 100 }
});

PonySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/pony/${this._id}`;
});

// Export model
const Pony = mongoose.model("Pony", PonySchema);
export default Pony;