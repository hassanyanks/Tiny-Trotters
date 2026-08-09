import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CityAddressSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  zipcode: { type: String, required: true, minLength:  5, maxLength: 9, unique: true },
  cityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
  stateId: { type: Schema.Types.ObjectId, ref: "State", required: true },
});

CityAddressSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/cityaddress/${this._id}`;
});

// Export model
const CityAddress = mongoose.model("CityAddress", CityAddressSchema);
export default CityAddress;