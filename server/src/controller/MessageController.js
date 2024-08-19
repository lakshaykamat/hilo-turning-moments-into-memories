const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

class MessageController {
  // Send a message
  static async sendMessage(req, res) {
    try {
      const { conversationId, text, media } = req.body;

      // Create a new message
      const newMessage = await Message.create({
        conversationId,
        sender: req.user._id.toString(),
        text,
        media,
      });

      // Update the last message in the conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
      });

      res.status(201).json(await newMessage.populate("sender"));
    } catch (error) {
      res.status(500).json({ error: "Unable to send message" });
    }
  }

  // Get messages for a conversation
  static async getMessages(req, res) {
    try {
      const { conversationId } = req.params;

      // Fetch messages for the conversation, sorted with the newest first
      const messages = await Message.find({ conversationId })
        // .sort({ createdAt: -1 })
        .populate("sender");

      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch messages" });
    }
  }

  // Update message status (e.g., read, delivered)
  static async updateMessageStatus(req, res) {
    try {
      const { messageId } = req.params;
      const { status } = req.body;

      // Update the message status
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { status },
        { new: true }
      );

      res.status(200).json(updatedMessage);
    } catch (error) {
      res.status(500).json({ error: "Unable to update message status" });
    }
  }

  // Soft delete a message
  static async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;

      // Mark the message as deleted
      await Message.findByIdAndUpdate(messageId, { isDeleted: true });

      res.status(200).json({ message: "Message deleted" });
    } catch (error) {
      res.status(500).json({ error: "Unable to delete message" });
    }
  }
}

module.exports = MessageController;
