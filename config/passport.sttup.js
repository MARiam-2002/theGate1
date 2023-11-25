import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv";
import userModel from "../DB/models/user.model.js";
dotenv.config();
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});
passport.use(
  new GoogleStrategy(
    {
      callbackURL: "https://the-gate-1.vercel.app/auth/google/redirect",
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const checkUser = await userModel.findOne({ googleId: profile.id });
      if (checkUser) {
        done(null, checkUser);
        console.log(`user is ${checkUser}`);
      } else {
        const user = await userModel.create({
          nameEnglish: profile.displayName,
          googleId: profile.id,
          "profileImage.url": profile._json.picture,
          email: profile._json.email,
        });
        done(null, user);
      }
    }
  )
);

// Configure Passport for JWT

export default passport;
