const mongoose = require("mongoose");
const Comment = require("./Comment");
const Schema = mongoose.Schema;

// Define Post schema
const PostSchema = new Schema({
  content: { type: String, maxlength: 500 },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  media: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to ensure either content or file is provided
PostSchema.pre("validate", function (next) {
  if (!this.content && !this.file) {
    next(new Error("Either content or image/video must be provided"));
  } else {
    next();
  }
});

// Middleware to update timestamps
PostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to add a comment to the post
PostSchema.methods.addComment = async function (commentContent, authorId) {
  const comment = await Comment.create({
    text: commentContent,
    author: authorId,
    postId: this._id,
  });
  await this.save();

  return comment;
};

// Create Post model
const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
