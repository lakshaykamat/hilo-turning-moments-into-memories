const express = require("express");
const router = express.Router();
const MessageController = require("../controller/MessageController");

// Send a message
router.post("/", MessageController.sendMessage);

// Get messages for a conversation
router.get("/:conversationId", MessageController.getMessages);

// Update message status (e.g., read, delivered)
router.patch("/:messageId/status", MessageController.updateMessageStatus);

// Soft delete a message
router.delete("/:messageId", MessageController.deleteMessage);

module.exports = router;
