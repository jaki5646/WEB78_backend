import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  ID: { type: Number, require: true },
  name: { type: String, require: true },
  time: { type: Number, require: true },
  year: { type: Number, require: true },
  image: { type: String, require: true },
  introduce: { type: String, require: true },
  isDeleted: { type: Boolean, require: true },
});

export const itemModel = mongoose.model("items", itemSchema);
