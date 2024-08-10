const mongoose = require("mongoose");
const Reply = require("./Reply");

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CommentSchema.methods.addReply = async function (replyContent, authorId) {
  const reply = await Reply.create({
    text: replyContent,
    author: authorId,
    commentId: this._id,
  });

  // Increment the reply count
  this.replyCount += 1;
  await this.save();

  return reply;
};
// Create Comment model
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
