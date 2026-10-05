import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const EventCategorySchema = new Schema({
  category: { type: String, required: true, unique: true }
});

EventCategorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/event-category/${this._id}`;
});

// Export model
const EventCategory = mongoose.model("EventCategory", EventCategorySchema);
export default EventCategory;