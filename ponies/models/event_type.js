import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const EventTypeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: "EventCategory", required: true },
  image: { type: String, required: false },
  customPrice: { type: Schema.Types.Decimal128, default: null }
}, {
  // Ensure virtuals are included when converting documents to JSON or Objects
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define the 'price' virtual to handle the fallback and override logic
EventTypeSchema.virtual("price")
  .get(function () {
    // If an explicit override exists, return it
    if (this.customPrice != null) {
      return this.customPrice;
    }
    // Otherwise, fall back to the populated category's price
    return this.category && this.category.price ? this.category.price : null;
  })
  .set(function (value) {
    // Allows you to set `eventType.price = 100` directly
    this.customPrice = value;
  });

EventTypeSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/event-type/${this._id}`;
});

// Export model
const EventType = mongoose.model("EventType", EventTypeSchema);
export default EventType;