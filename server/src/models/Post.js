const mongoose = require("mongoose");
const Comment = require("./Comment");
const Like = require("./Like");
const Schema = mongoose.Schema;

// Define Post schema
const PostSchema = new Schema({
  content: { type: String, maxlength: 10000 },
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

PostSchema.methods.format = async function () {
  const post = await Post.findOne({ _id: this._id })
    .populate("author", "-password -__v")
    .select("-__v");

  const likes = await Like.find({
    targetId: post._id,
    targetType: "Post",
  })
    .populate("userId", "-password -__v")
    .select("-__v");
  const comments = await Comment.find({
    postId: post._id,
  })
    .populate("author", "-password -__v")
    .select("-__v");
  const shares = await Comment.find({
    postId: post._id,
  }).select("-__v");
  const commentsUserIds = comments.map((comment) => comment.author._id);
  const sharesUserIds = shares.map((share) => share.userId);
  const likesUser = likes.map((like) => like.userId);

  return {
    ...post._doc,
    likes: likesUser,
    shares: sharesUserIds,
    comments: comments,
  };
};

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
