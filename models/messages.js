const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MesssageBoardSchema = new Schema({
  message: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  inserted: {
    type: Date,
    default: Date.now,
  },
});
const Message = mongoose.model("Message", MesssageBoardSchema);

module.exports = Message;
