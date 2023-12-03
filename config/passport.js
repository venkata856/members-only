const User = require("../models/user");
var session = require("express-session");
const validatePassword = require("../utils/passwordUtils").validatePassword;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const callBack = async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return done(false, false, { message: "In correct user name" });
    }
    const validPassword = await validatePassword(
      password,
      user.salt,
      user.hash
    );
    if (!validPassword) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

passport.use(new LocalStrategy(callBack));
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
