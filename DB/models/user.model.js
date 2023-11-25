import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    name: String,
    nameArabic: {
      type: String,
      min: 8,
      max: 25,
    },
    nameEnglish: {
      type: String,
      required: true,
      min: 8,
      max: 25,
    },
    googleId: String,
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    address: {
      type: String,
      min: 10,
      max: 50,
    },
    title: {
      type: String,
      min: 5,
      max: 20,
    },
    slugTitle: String,
    memberShip: String,
    package: Types.ObjectId,
    location: { type: { type: String }, coordinates: [] },
    country: String,
    phone: String,
    whatsAppNumber: String,
    Region: String,
    advTitle: String,
    adv: String,
    description: {
      type: String,
      min: 10,
      max: 200,
    },
    socialLink: {
      facebook: String,
      linkedin: String,
      youtube: String,
      instagram: String,
      github: String,
      profile: String,
      others: String,
    },
    workingHours: [{ start: Number, End: Number }],
    workingDays: [String],
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    role: {
      type: String,
      enum: ["admin", "user", "visitor"],
      default: "visitor",
      required: true,
    },

    isConfirmed: {
      type: Boolean,
      default: false,
    },
    forgetCode: String,
    activationCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dz5dpvxg7/image/upload/v1691521498/ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc.png",
      },
      id: {
        type: String,
        default:
          "ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc",
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.userModel || model("User", userSchema);
export default userModel;
