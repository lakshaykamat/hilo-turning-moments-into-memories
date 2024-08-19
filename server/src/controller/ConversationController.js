const { HttpStatusCode } = require("axios");
const { CustomError } = require("../lib/util");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

class ConversationController {
  // Create a new conversation
  static async createConversation(req, res, next) {
    try {
      const { participants, isGroupChat, groupName, groupPicture } = req.body;

      // Get current user's ID
      const currentUserID = req.user._id.toString();

      // Edge Case 1: Ensure participants are provided
      if (!participants || !Array.isArray(participants)) {
        return res.status(400).json({ error: "Participants are required" });
      }

      // Edge Case 2: Add current user to participants array and ensure uniqueness
      let updatedParticipants = [...participants, currentUserID];
      updatedParticipants = [...new Set(updatedParticipants)];
      console.log(updatedParticipants);

      // Edge Case 3: Ensure all participants are valid user IDs (replace this with real validation)
      // if (!updatedParticipants.every((id) => typeof id === "string")) {
      //   return res.status(400).json({ error: "Invalid user ID(s) provided" });
      // }

      // Edge Case 4: For private chats, ensure the user isn't creating a chat with themselves
      if (!isGroupChat && updatedParticipants.length === 1) {
        return res
          .status(400)
          .json({ error: "Cannot create a private chat with yourself" });
      }

      // Edge Case 5: For group chats, ensure there are at least 3 distinct participants (including current user)
      if (isGroupChat && updatedParticipants.length < 3) {
        return res
          .status(400)
          .json({ error: "Group chats must have at least 3 participants" });
      }

      // Edge Case 6: For group chats, ensure no more than 10 participants
      if (isGroupChat && updatedParticipants.length > 10) {
        return res
          .status(400)
          .json({ error: "Group chats can have a maximum of 10 participants" });
      }

      // Edge Case 7: Ensure group chats have a valid group name
      if (isGroupChat && (!groupName || groupName.trim() === "")) {
        return res
          .status(400)
          .json({ error: "Group chats must have a valid group name" });
      }

      // Edge Case 8: Handle missing group picture by assigning a default picture if none is provided
      const defaultGroupPicture = "uploads\\default.jpg"; // Replace with your default picture URL
      const finalGroupPicture = groupPicture || defaultGroupPicture;

      // Create the conversation
      const newConversation = await Conversation.create({
        participants: updatedParticipants,
        isGroupChat,
        groupName,
        groupPicture: finalGroupPicture,
      });

      res.status(201).json(newConversation);
    } catch (error) {
      res.status(500).json({ error: "Unable to add participant" });
    }
  }

  // Get all conversations for a user
  static async getConversations(req, res) {
    try {
      const { userId } = req.params;

      const conversations = await Conversation.find({
        participants: userId,
      }).populate("lastMessage participants");

      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch conversations" });
    }
  }

  // Get a single conversation by ID
  static async getConversationById(req, res) {
    try {
      const { conversationId } = req.params;

      const conversation = await Conversation.findById(conversationId).populate(
        "lastMessage participants"
      );

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch conversation" });
    }
  }

  static async getConverstionByUsername(req, res) {
    try {
      const { username } = req.params;

      // Find the user by the username
      const targetUser = await User.findOne({ username });
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const loggedInUserId = req.user._id; // Assuming req.user contains the logged-in user's data

      // Find the conversation between the logged-in user and the target user
      const conversation = await Conversation.findOne({
        participants: { $all: [loggedInUserId, targetUser._id] }, // Check both users are participants
      }).populate("lastMessage participants", "-password -__v");

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({
        error: "Unable to fetch conversation",
        details: error.message,
      });
    }
  }

  // Delete a conversation
  static async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;

      await Conversation.findByIdAndDelete(conversationId);

      res.status(200).json({ message: "Conversation deleted" });
    } catch (error) {
      res.status(500).json({ error: "Unable to delete conversation" });
    }
  }

  // Add participant to a group chat
  static async addParticipant(req, res) {
    try {
      const { conversationId } = req.params;
      const { participantId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $addToSet: { participants: participantId } }, // Add participant without duplicates
        { new: true }
      ).populate("participants");

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Unable to add participant" });
    }
  }

  // Remove participant from group chat
  static async removeParticipant(req, res) {
    try {
      const { conversationId } = req.params;
      const { participantId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $pull: { participants: participantId } }, // Remove participant
        { new: true }
      ).populate("participants");

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Unable to remove participant" });
    }
  }
}

module.exports = ConversationController;
