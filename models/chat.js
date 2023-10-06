const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    userId: {
      type: String,

      required: true,
    },

    content: [
      {
        message: {
          type: String,
          required: true,
        },
        is_admin: {
          type: Boolean,
          required: true,
        },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
