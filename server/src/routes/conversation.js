const express = require("express");
const router = express.Router();

const ConversationController = require("../controller/ConversationController");
const { isAuthenticated } = require("../middleware");

// Create a new conversation
router.post("/", isAuthenticated, ConversationController.createConversation);

// Get all conversations for a user
router.get("/:userId", ConversationController.getConversations);
router.get(
  "/username/:username",
  ConversationController.getConverstionByUsername
);

// Get a single conversation by ID
router.get(
  "/detail/:conversationId",
  ConversationController.getConversationById
);

// Delete a conversation (soft delete can be added)
router.delete("/:conversationId", ConversationController.deleteConversation);

// Add participant to group chat
router.post(
  "/:conversationId/participants",
  ConversationController.addParticipant
);

// Remove participant from group chat
router.delete(
  "/:conversationId/participants",
  ConversationController.removeParticipant
);

module.exports = router;
