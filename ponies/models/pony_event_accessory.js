import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PonyEventAccessorySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  pony: { type: Schema.Types.ObjectId, ref: "Pony", required: true },
  event: { type: Schema.Types.ObjectId, ref: "ScheduledEvent", required: true },
  accessory: { type: Schema.Types.ObjectId, ref: "Accessory", required: true },
});

// Virtual for product sample URL
PonyEventAccessorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/ponyeventaccessory/${this._id}`;
});

// Export model
const PonyEventAccessory = mongoose.model("PonyEventAccessory", PonyEventAccessorySchema);
export default PonyEventAccessory;