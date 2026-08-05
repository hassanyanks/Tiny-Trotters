import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AccessorySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, minLength:  3, maxLength: 100, unique: false },
  image: { type: String, required: true, minLength:  5, maxLength: 100 }
});

AccessorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/accessory/${this._id}`;
});

// Export model
const Accessory = mongoose.model("Accessory", AccessorySchema);
export default Accessory;