const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Indexing to improve query performance
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null, // Store the latest message for quick retrieval
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true, // Clean up input by removing unnecessary whitespace
      default: null,
    },
    groupPicture: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual to count the number of participants
ConversationSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Virtual to check if it's a one-on-one chat
ConversationSchema.virtual("isOneOnOne").get(function () {
  return this.participants.length === 2 && !this.isGroupChat;
});

module.exports = mongoose.model("Conversation", ConversationSchema);
