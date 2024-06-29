const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const { HttpStatusCode, CustomError } = require("../lib/util");

/**
 * @route POST /api/v1/messages
 * @description Send a new message
 * @access Private
 */
router.post("/", isAuthenticated, async (req, res, next) => {
  const { content, chatRoom } = req.body;

  try {
    // Check if the logged-in user is included in the chat room's users array
    const chatRoomExists = await ChatRoom.findOne({
      _id: chatRoom,
      users: req.user.id,
    });

    if (!chatRoomExists) {
      throw new CustomError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to send messages in this chat room"
      );
    }

    const message = new Message({
      sender: req.user.id,
      content,
      chatRoom,
    });

    const savedMessage = await message.save();
    res.status(HttpStatusCode.CREATED).json(savedMessage);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/messages/chatroom/:chatRoomId
 * @description Get all messages for a specific chat room
 * @access Private
 */
router.get("/chatroom/:chatRoomId", isAuthenticated, async (req, res, next) => {
  try {
    // Check if the logged-in user is a member of the specified chat room
    const chatRoomExists = await ChatRoom.findOne({
      _id: req.params.chatRoomId,
      users: req.user.id,
    });

    if (!chatRoomExists) {
      throw new CustomError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to access messages in this chat room"
      );
    }

    // Retrieve messages for the specified chat room
    const messages = await Message.find({
      chatRoom: req.params.chatRoomId,
    }).populate("sender", "username");

    res.status(HttpStatusCode.OK).json(messages);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/messages/:messageId
 * @description Get a specific message
 * @access Private
 */
router.get("/:messageId", isAuthenticated, async (req, res, next) => {
  try {
    // Find the message by ID and populate sender details
    const message = await Message.findById(req.params.messageId).populate(
      "sender",
      "username"
    );

    // Check if message exists
    if (!message) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Message not found");
    }

    // Check if the logged-in user is a member of the chat room associated with the message
    const chatRoom = await ChatRoom.findOne({
      _id: message.chatRoom,
      users: req.user.id,
    });

    // If the logged-in user is not a member of the chat room, throw an error
    if (!chatRoom) {
      throw new CustomError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to access this message"
      );
    }

    // If authorized, send the message details in the response
    res.status(HttpStatusCode.OK).json(message);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/v1/messages/:messageId
 * @description Update a message
 * @access Private
 */
router.put("/:messageId", isAuthenticated, async (req, res, next) => {
  try {
    // Find the message by ID
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Message not found");
    }

    // Check if the logged-in user is the sender of the message
    if (message.sender.toString() !== req.user.id) {
      throw new CustomError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to update this message"
      );
    }

    // Update the message content if provided in the request body
    const { content } = req.body;
    message.content = content || message.content;

    // Save the updated message
    const updatedMessage = await message.save();
    res.status(HttpStatusCode.OK).json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/v1/messages/:messageId
 * @description Delete a message
 * @access Private
 */
router.delete("/:messageId", isAuthenticated, async (req, res, next) => {
  try {
    // Find the message by ID
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Message not found");
    }

    // Check if the logged-in user is the sender of the message
    if (message.sender.toString() !== req.user.id) {
      throw new CustomError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to delete this message"
      );
    }

    // Remove the message from the database
    await message.remove();
    res.status(HttpStatusCode.OK).json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
