const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Message = require("./Message"); // Assuming Message model is imported

// Define ChatRoomSchema
const ChatRoomSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, enum: ["private", "group"], default: "group" }, // Chat room type
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who created the chat room
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt field on save
ChatRoomSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to remove associated messages when a chat room is removed
ChatRoomSchema.pre("remove", async function (next) {
  try {
    // Remove all messages in this chat room
    await Message.deleteMany({ chatRoom: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find chat rooms by user
ChatRoomSchema.statics.findByUser = function (userId) {
  return this.find({ users: userId })
    .populate("users", "username")
    .populate("createdBy", "username");
};

// Static method to find chat rooms by type
ChatRoomSchema.statics.findByType = function (type) {
  return this.find({ type })
    .populate("users", "username")
    .populate("createdBy", "username");
};

// Static method to add a user to a chat room
ChatRoomSchema.statics.addUserToChatRoom = async function (chatRoomId, userId) {
  const chatRoom = await this.findById(chatRoomId);
  if (chatRoom && !chatRoom.users.includes(userId)) {
    chatRoom.users.push(userId);
    await chatRoom.save();
  }
  return chatRoom;
};

// Static method to remove a user from a chat room
ChatRoomSchema.statics.removeUserFromChatRoom = async function (
  chatRoomId,
  userId
) {
  const chatRoom = await this.findById(chatRoomId);
  if (chatRoom) {
    chatRoom.users = chatRoom.users.filter(
      (user) => user.toString() !== userId
    );
    await chatRoom.save();
  }
  return chatRoom;
};

// Instance method to format chat room data
ChatRoomSchema.methods.formatChatRoom = function () {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    users: this.users,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
