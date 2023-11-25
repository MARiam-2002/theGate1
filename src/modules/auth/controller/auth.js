import dotenv from "dotenv";
dotenv.config();
import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmails.js";
import { resetPassword, signupTemp } from "../../../utils/generateHtml.js";
import tokenModel from "../../../../DB/models/token.model.js";
import randomstring from "randomstring";
import cloudinary from "../../../utils/cloud.js";
import cartModel from "../../../../DB/models/cart.model.js";

export const register = asyncHandler(async (req, res, next) => {
  const isUser = await userModel.findOne({ email: req.body.email });
  if (isUser) {
    return next(new Error("email already registered !", { cause: 409 }));
  }

  const hashPassword = bcrypt.hashSync(
    req.body.password,
    +process.env.SALT_ROUND
  );
  const activationCode = crypto.randomBytes(64).toString("hex");
  const user = await userModel.create({
    ...req.body,
    workingDays: JSON.parse(req.body.workingDays),
    socialLink: JSON.parse(req.body.socialLink),
    workingHours: JSON.parse(req.body.workingHours),
    password: hashPassword,
    activationCode,
  });
  if (!req.body.Latitude || !req.body.Longitude) {
    return next(new Error("Lat and Long is not defined"));
  }
  await userModel.findOneAndUpdate(
    { email: user.email },
    {
      location: {
        type: "points",
        coordinates: [
          parseFloat(req.body.Latitude),
          parseFloat(req.body.Longitude),
        ],
      },
    }
  );

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUDINARY}/${
        user.role == "visitor" ? "visitor" : "user"
      }`,
    }
  );
  await userModel.findOneAndUpdate(
    { email: req.body.email },
    { profileImage: { url: secure_url, id: public_id } }
  );

  const link = `http://localhost:${process.env.PORT}/auth/confirmEmail/${activationCode}`;
  if (user.role === "visitor") {
    const isSent = await sendEmail({
      to: user.email,
      subject: "Activate Account",
      html: signupTemp(link, true),
    });

    return isSent
      ? res
          .status(200)
          .json({ success: true, message: "Please review Your email!" ,user})
      : next(new Error("something went wrong!", { cause: 400 }));
  } else if (user.role === "admin") {
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { isConfirmed: true, $unset: { activationCode: 1 } }
    );
    return res.status(200).json({ success: true, message: "success!" });
  } else {
    const isSent = await sendEmail({
      to: "kasaby1415@gmail.com",
      subject: "accept user business",
      html: signupTemp(user, false),
    });
    await cartModel.create({ user: user._id });
    return isSent
      ? res.status(200).json({ success: true, message: "done!",user })
      : next(new Error("something went wrong!", { cause: 400 }));
  }
});

export const activationAccount = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndUpdate(
    { activationCode: req.params.activationCode },
    { isConfirmed: true, $unset: { activationCode: 1 } }
  );

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }
  if (user.role == "visitor") {
    await cartModel.create({ user: user._id });
  }
  return res
    .status(200)
    .send("Congratulation, Your Account is now activated, try to login");
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new Error("Invalid-Email", { cause: 400 }));
  }

  if (!user.isConfirmed) {
    return next(new Error("Un activated Account", { cause: 400 }));
  }

  const match = bcrypt.compareSync(password, user.password);

  if (!match) {
    return next(new Error("Invalid-Password", { cause: 400 }));
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.TOKEN_KEY,
    { expiresIn: "2d" }
  );

  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  user.status = "online";
  await user.save();

  return res.status(200).json({ success: true, result: token });
});

//send forget Code

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new Error("Invalid email!", { cause: 400 }));
  }

  const code = randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  user.forgetCode = code;
  await user.save();

  return (await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: resetPassword(code),
  }))
    ? res.status(200).json({ success: true, message: "check you email!" })
    : next(new Error("Something went wrong!", { cause: 400 }));
});

export const resetPasswordByCode = asyncHandler(async (req, res, next) => {
  const newPassword = bcrypt.hashSync(
    req.body.password,
    +process.env.SALT_ROUND
  );
  const checkUser = await userModel.findOne({ email: req.body.email });
  if (!checkUser) {
    return next(new Error("Invalid email!", { cause: 400 }));
  }
  if (checkUser.forgetCode !== req.body.forgetCode) {
    return next(new Error("Invalid code!", { status: 400 }));
  }
  const user = await userModel.findOneAndUpdate(
    { email: req.body.email },
    { password: newPassword, $unset: { forgetCode: 1 } }
  );

  //invalidate tokens
  const tokens = await tokenModel.find({ user: user._id });

  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  return res
    .status(200)
    .json({ success: true, message: "Try to login!", tokens });
});
