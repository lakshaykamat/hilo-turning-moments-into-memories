const mongoose = require("mongoose");
const Post = require("./Post");
const Reply = require("./Reply");
const Comment = require("./Comment");
const { CustomError } = require("../lib/util");

const LikeSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: {
    type: String,
    enum: ["Post", "Comment", "Reply"],
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

LikeSchema.statics.toggleLike = async function (userId, targetId, targetType) {
  const existingLike = await this.findOne({ userId, targetId, targetType });

  if (existingLike) {
    await this.deleteOne({ _id: existingLike._id });
    return false; // Indicates that the like was removed
  } else {
    let isValidTarget = false;

    // Validate that targetId belongs to the correct type
    if (targetType === "Post") {
      isValidTarget = await Post.exists({ _id: targetId });
    } else if (targetType === "Comment") {
      isValidTarget = await Comment.exists({ _id: targetId });
    } else if (targetType === "Reply") {
      isValidTarget = await Reply.exists({ _id: targetId });
    }

    if (isValidTarget) {
      await this.create({ userId, targetId, targetType });
      return true; // Indicates that the like was added
    }

    throw new CustomError(
      400,
      `Invalid ${targetType} ID. Please provide a valid ${targetType} ID.`
    );
  }
};

const Like = mongoose.model("Like", LikeSchema);
module.exports = Like;
