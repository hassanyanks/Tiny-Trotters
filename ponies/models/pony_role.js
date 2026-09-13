import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PonyRoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: [String], required: false }
});

PonyRoleSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/pony/${this._id}`;
});

// Export model
const PonyRole = mongoose.model("Pony", PonyRoleSchema);
export default PonyRole;