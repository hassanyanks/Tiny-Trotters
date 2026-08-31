import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PonyEventAccessorySchema = new Schema({
  accessories: { type: String, required: true },
});

// Virtual for product sample URL
PonyEventAccessorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/ponyeventaccessory/${this._id}`;
});

// Export model
const PonyEventAccessory = mongoose.model("PonyEventAccessory", PonyEventAccessorySchema);
export default PonyEventAccessory;