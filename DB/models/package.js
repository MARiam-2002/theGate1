import mongoose, { Schema, Types, model } from "mongoose";

const packageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    expiredAt: String,
    productLimit: Number,
  },
  { timestamps: true }
);
const packageModel =
  mongoose.models.packageModel || model("Token", packageSchema);
export default packageModel;
