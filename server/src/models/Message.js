const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      index: true, // Indexing to speed up fetching messages by conversation
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexing for fast lookups on sent messages
    },
    text: {
      type: String,
      required: true,
      trim: true, // Trim any extra spaces for neat storage
    },
    media: {
      type: String, // URL to the media file if any (image, video)
      default: null,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete feature
    },
  },
  { timestamps: true }
);

// Virtual property to check if message is read
MessageSchema.virtual("isRead").get(function () {
  return this.status === "read";
});

// Virtual property to check if message is media
MessageSchema.virtual("isMedia").get(function () {
  return this.media !== null;
});

module.exports = mongoose.model("Message", MessageSchema);
