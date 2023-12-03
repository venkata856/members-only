var express = require("express");
var router = express.Router();
const genHashFromPassword =
  require("../utils/passwordUtils").genHashFromPassword;
const User = require("../models/user");
const Messages = require("../models/messages");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const messages = await Messages.find().populate("user").exec();
    res.render("messages_list", {
      title: "Register User",
      messages: messages,
      user: req.user,
    });
  })
);

// POST request for creating User.
const message_create_post = [
  body("message", "message must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    console.log(req.user);
    const message = new Messages({
      message: req.body.message,
      user: req.user,
    });

    if (errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      await message.save();
      res.redirect("/messages/");
    } else {
      const messages = await Messages.find().populate("user").exec();
      console.log("consloed.log", messages);
      res.render("messages_list", {
        title: "Register User",
        messages: messages,
        user: req.user,
        errors: errors.array(),
      });
    }
  }),
];

// POST request to delete Book.
const message_delete_post = asyncHandler(async (req, res, next) => {
  await Messages.findByIdAndDelete(req.body.messageid);
  res.redirect("/messages/");
});

router.post("/", message_create_post);
router.post("/delete", message_delete_post);

module.exports = router;
