var express = require("express");
var router = express.Router();
const genHashFromPassword =
  require("../utils/passwordUtils").genHashFromPassword;
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get(
  "/register",
  asyncHandler(async (req, res, next) => {
    res.render("register_form", { title: "Register User" });
  })
);

// POST request for creating User.
const product_create_post = [
  body("firstname", "firstname must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("lastname", "lastname must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("username", "username must not be empty.")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("password", "password must not be empty")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    const passwordSaltHash = await genHashFromPassword(req.body.password);
    const user = new User({
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      username: req.body.username,
      salt: passwordSaltHash.salt,
      hash: passwordSaltHash.hash,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("register_form", {
        title: "Register user",
        user: user,
        errors: errors.array(),
      });
    } else {
      const existingUser = await User.findOne({ username: req.body.username });

      if (!existingUser) {
        await user.save();
        res.redirect("/user/login");
      } else {
        const customeError = [
          {
            msg: `${existingUser.username} already existis please use diffrent one`,
          },
        ];
        res.render("register_form", {
          title: "Register user",
          user: user,
          errors: customeError,
        });
      }
    }
  }),
];

router.post("/register", product_create_post);

router.get(
  "/login",
  asyncHandler(async (req, res, next) => {
    res.render("login_form", { title: "User Login", user: req.user });
  })
);

router.get(
  "/logout",
  asyncHandler(async (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/messages/");
    });
  })
);

router.get(
  "/login/fail",
  asyncHandler(async (req, res, next) => {
    const customeError = [
      {
        msg: `user do not exist in our records please register`,
      },
    ];
    res.render("register_form", {
      title: "Register User",
      errors: customeError,
    });
  })
);

module.exports = router;
