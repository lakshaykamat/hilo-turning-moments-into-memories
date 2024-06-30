const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define Comment schema
const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  replies: [
    {
      content: { type: String, required: true },
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Define Post schema
const PostSchema = new Schema({
  content: { type: String, required: true, maxlength: 500 },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema], // Array of comments
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update timestamps
PostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find all posts
PostSchema.statics.findAll = function () {
  return this.find().populate("author", "username");
};

// Static method to find a post by ID
PostSchema.statics.findById = function (postId) {
  return this.findOne({ _id: postId }).populate("author", "username");
};

// Instance method to format post data
PostSchema.methods.formatPost = function () {
  return {
    id: this._id,
    content: this.content,
    author: this.author,
    likes: this.likes,
    comments: this.comments.map((comment) => ({
      id: comment._id,
      content: comment.content,
      author: comment.author,
      likes: comment.likes,
      replies: comment.replies,
      createdAt: comment.createdAt,
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Instance method to add a comment to the post
PostSchema.methods.addComment = async function (commentContent, authorId) {
  this.comments.push({
    content: commentContent,
    author: authorId,
  });
  await this.save();
};

// Instance method to add a reply to a comment
PostSchema.methods.addReply = async function (
  commentId,
  replyContent,
  authorId
) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }
  comment.replies.push({
    content: replyContent,
    author: authorId,
  });
  await this.save();
};

// Instance method to toggle like/unlike on a comment
PostSchema.methods.toggleLike = async function (commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const index = comment.likes.indexOf(userId);
  if (index === -1) {
    // User has not liked the comment, add like
    comment.likes.push(userId);
  } else {
    // User has already liked the comment, remove like
    comment.likes.splice(index, 1);
  }

  await this.save();
};

// Instance method to toggle like/unlike on a reply
PostSchema.methods.toggleReplyLike = async function (
  commentId,
  replyId,
  userId
) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw new Error("Reply not found");
  }

  const index = reply.likes.indexOf(userId);
  if (index === -1) {
    // User has not liked the reply, add like
    reply.likes.push(userId);
  } else {
    // User has already liked the reply, remove like
    reply.likes.splice(index, 1);
  }

  await this.save();
};

// Create Post model
const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
