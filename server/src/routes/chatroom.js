// routes/chatrooms.js
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");
const { HttpStatusCode, CustomError } = require("../lib/util");

const validateUserIds = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    throw new CustomError(
      HttpStatusCode.BAD_REQUEST,
      "One or more user IDs are invalid"
    );
  }
  return users;
};

const checkUniqueUsers = (userIds) => {
  if (userIds.length !== new Set(userIds).size) {
    throw new CustomError(HttpStatusCode.BAD_REQUEST, "Users must be unique");
  }
};

/**
 * @route POST /api/v1/chatrooms
 * @description Create a new chat room
 * @access Private
 */
router.post("/", async (req, res, next) => {
  try {
    let { name, type, users } = req.body;

    // Validate input
    if (!name || !type || !Array.isArray(users)) {
      throw new CustomError(HttpStatusCode.BAD_REQUEST, "Invalid input data");
    }

    // Extract user IDs
    const userIds = users.map((user) => user._id);

    // Check for unique users
    checkUniqueUsers(userIds);

    // Validate user IDs
    await validateUserIds(userIds);

    // Validate users array length based on chat room type
    if (type === "private" && userIds.length !== 1) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Private chat rooms must contain exactly one other user"
      );
    }

    if (type === "group" && userIds.length < 2) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Group chat rooms must contain at least two other users"
      );
    }

    // Ensure logged-in user's ID is not already in the users array
    if (userIds.includes(req.user.id)) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Logged-in user cannot be in the users array"
      );
    }

    // Add the current user to the chat room users list
    const chatRoomUsers = [...userIds, req.user.id];

    // Get usernames for naming the private chat room
    const usersExist = await User.find({ _id: { $in: userIds } });
    const chatRoomName =
      type === "private"
        ? `private-chat-of-${req.user.username}-and-${usersExist[0].username}`
        : name;

    // Create the chat room instance
    const chatRoom = new ChatRoom({
      name: chatRoomName,
      type,
      users: chatRoomUsers,
      createdBy: req.user.id,
    });

    // Save the chat room to the database
    const savedChatRoom = await chatRoom.save();

    // Respond with the created chat room data
    res.status(HttpStatusCode.CREATED).json(savedChatRoom);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});

/**
 * @route GET /api/v1/chatrooms
 * @description Get all chat rooms the logged-in user is a part of
 * @access Private
 */
router.get("/", async (req, res, next) => {
  try {
    // Find chat rooms where the logged-in user is present in the users array
    const chatRooms = await ChatRoom.find({
      users: { $in: [req.user.id] },
    }).populate("users", "username");

    // Respond with the chat rooms
    res.status(HttpStatusCode.OK).json(chatRooms);
  } catch (error) {
    // Pass any errors to the error-handling middleware
    next(error);
  }
});

/**
 * @route GET /api/v1/chatrooms/:id
 * @description Get a specific chat room
 * @access Private
 */
router.get("/:id", async (req, res, next) => {
  try {
    // Find the chat room by ID and populate the users field with usernames
    const chatRoom = await ChatRoom.findById(req.params.id).populate(
      "users",
      "username"
    );

    // Check if the chat room exists
    if (!chatRoom) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Chat room not found");
    }

    // Check if the logged-in user is part of the chat room's users array
    if (!chatRoom.users.some((user) => user._id.equals(req.user.id))) {
      throw new CustomError(HttpStatusCode.FORBIDDEN, "Access denied");
    }

    // Respond with the chat room data
    res.status(HttpStatusCode.OK).json(chatRoom);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/v1/chatrooms/:id
 * @description Update a chat room
 * @access Private
 */
router.put("/:id", async (req, res, next) => {
  try {
    //TODO Add security in update chat room route that only vaild user can update his chat room not others
    const chatRoom = await ChatRoom.findById(req.params.id);
    if (!chatRoom) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Chat room not found");
    }

    const { name, type, users } = req.body;
    chatRoom.name = name || chatRoom.name;
    chatRoom.type = type || chatRoom.type;
    chatRoom.users = users || chatRoom.users;

    const updatedChatRoom = await chatRoom.save();
    res.status(HttpStatusCode.OK).json(updatedChatRoom);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/v1/chatrooms/:id
 * @description Delete a chat room
 * @access Private
 */
router.delete("/:id", async (req, res, next) => {
  try {
    //TODO Only user can delete his chat room not others
    const chatRoom = await ChatRoom.findById(req.params.id);
    if (!chatRoom) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Chat room not found");
    }

    await chatRoom.remove();
    res.status(HttpStatusCode.OK).json({ message: "Chat room deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
