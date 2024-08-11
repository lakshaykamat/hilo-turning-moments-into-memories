const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Post = require("./Post");
const Share = require("./Share");
const Like = require("./Like");
const Comment = require("./Comment");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  name: { type: String, required: true, maxlength: 50 },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
  },
  password: { type: String, required: true, minlength: 6 },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  profilePicture: { type: String, maxlength: 255, required: true },
  bio: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ["online", "offline", "busy"],
    default: "offline",
  }, // User status
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Static method to find user by email
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// Static method to get users by status
UserSchema.statics.findByStatus = function (status) {
  return this.find({ status });
};

UserSchema.methods.getPosts = async function () {
  // Fetch posts by the user and sort by creation date in descending order
  const posts = await Post.find({ author: this._id })
    .sort({
      createdAt: -1,
    })
    .populate("author");

  // Iterate through each post to fetch likes and shares
  const postsWithLikesAndShares = await Promise.all(
    posts.map(async (post) => {
      // Fetch likes for the current post
      const postLikes = await Like.find({
        targetId: post._id,
        targetType: "Post",
      });
      const postLikesUserIds = postLikes.map((like) => like.userId);

      // Fetch shares for the current post
      const postShares = await Share.find({ postId: post._id });
      const postSharesUserIds = postShares.map((share) => share.userId);

      const postComments = await Comment.find({ postId: post._id });
      const postCommentUserIds = postComments.map((comment) => comment.author);
      // Attach likes and shares information to the post object
      return {
        ...post.toObject(),
        likes: postLikesUserIds,
        shares: postSharesUserIds,
        comments: postCommentUserIds,
      };
    })
  );

  return postsWithLikesAndShares;
};

module.exports = mongoose.model("User", UserSchema);
