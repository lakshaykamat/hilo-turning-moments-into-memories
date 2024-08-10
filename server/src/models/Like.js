const mongoose = require("mongoose");

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
    await existingLike.remove();
    return false; // Indicates that the like was removed
  } else {
    await this.create({ userId, targetId, targetType });
    return true; // Indicates that the like was added
  }
};
const Like = mongoose.model("Like", LikeSchema);
module.exports = Like;
