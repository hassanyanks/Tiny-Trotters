import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StateSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, minLength:  3, maxLength: 100, unique: true },
  image: { type: String, required: true, minLength:  5, maxLength: 100 }
});

StateSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/state/${this._id}`;
});

// Export model
const State = mongoose.model("State", StateSchema);
export default State;