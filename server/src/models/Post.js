const mongoose = require("mongoose");
const Comment = require("./Comment");
const Like = require("./Like");
const Share = require("./Share");
const Followers = require("./Follower");
const Following = require("./Following");
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
  // Fetch post details
  const post = await Post.findOne({ _id: this._id })
    .populate("author", "-password -__v")
    .select("-__v");

  // Fetch likes and user details
  const likes = await Like.find({
    targetId: post._id,
    targetType: "Post",
  })
    .populate("userId", "-password -__v")
    .select("-__v");

  // Fetch comments and shares
  const comments = await Comment.find({
    postId: post._id,
  })
    .populate("author", "-password -__v")
    .select("-__v");

  const shares = await Share.find({
    postId: post._id,
  }).select("-__v");

  // Collect all user IDs from likes
  const likesUserIds = likes.map((like) => like.userId._id);

  // Batch fetch followers and following lists
  const [followersLists, followingLists] = await Promise.all([
    Followers.find({ userId: { $in: likesUserIds } }).populate(
      "followers",
      "-password -__v"
    ),
    Following.find({ userId: { $in: likesUserIds } }).populate(
      "following",
      "-password -__v"
    ),
  ]);

  // Create maps for quick access to followers and following
  const followersMap = new Map(
    followersLists.map((f) => [f.userId.toString(), f.followers])
  );
  const followingMap = new Map(
    followingLists.map((f) => [f.userId.toString(), f.following])
  );

  // Map likes with user details, including followers and following
  const likesWithDetails = likes.map((like) => {
    const userIdStr = like.userId._id.toString();
    return {
      ...like.userId._doc,
      followers: followersMap.get(userIdStr) || [],
      following: followingMap.get(userIdStr) || [],
    };
  });

  // Prepare user IDs for comments and shares
  const commentsUserIds = comments.map((comment) => comment.author._id);
  const sharesUserIds = shares.map((share) => share.userId);

  // Return the formatted post with likes, shares, and comments
  return {
    ...post._doc,
    likes: likesWithDetails,
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
