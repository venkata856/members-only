var createError = require("http-errors");
var express = require("express");
var session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// const mongoose = require("mongoose");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const User = require("./models/user");
const validatePassword = require("./utils/passwordUtils").validatePassword;

//
require("./config/database");

var app = express();
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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 1000 * 60 },
  })
);

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
app.use(passport.initialize());
app.use(passport.session());
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var messagessRouter = require("./routes/messages");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(passport.authenticate("local"));
app.use("/user", usersRouter);
app.use("/messages", messagessRouter);

app.post(
  "/user/login",
  passport.authenticate("local", {
    successRedirect: "/messages/",
    failureRedirect: "/user/login/fail",
  })
);

app.get("/", function (req, res, next) {
  res.redirect("/messages/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render("error");
});

module.exports = app;
