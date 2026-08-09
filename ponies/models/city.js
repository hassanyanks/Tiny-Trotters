import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CitySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, minLength:  3, maxLength: 100, unique: true },
  stateId: { type: Schema.Types.ObjectId, ref: "State", required: true },
});

CitySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/city/${this._id}`;
});

// Export model
const City = mongoose.model("City", CitySchema);
export default City;