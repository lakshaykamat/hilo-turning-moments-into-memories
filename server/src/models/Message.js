const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define MessageSchema
const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 }, // Limiting message length
  chatRoom: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Static method to get messages by chat room
MessageSchema.statics.findByChatRoom = function(chatRoomId) {
  return this.find({ chatRoom: chatRoomId }).populate('sender', 'username').sort('createdAt');
};

// Static method to get recent messages in a chat room
MessageSchema.statics.findRecentMessages = function(chatRoomId, limit = 10) {
  return this.find({ chatRoom: chatRoomId })
    .populate('sender', 'username')
    .sort('-createdAt')
    .limit(limit);
};

// Instance method to format message
MessageSchema.methods.formatMessage = function() {
  return {
    id: this._id,
    sender: this.sender,
    content: this.content,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Message', MessageSchema);
