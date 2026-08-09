import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PictureSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: false, minLength:  3, maxLength: 100, unique: true },
  image: { type: String, required: true, minLength:  5, maxLength: 100 }
});

PictureSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/picture/${this._id}`;
});

// Export model
const Picture = mongoose.model("Picture", PictureSchema);
export default Picture;