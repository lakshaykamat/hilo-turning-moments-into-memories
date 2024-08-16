const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Post = require("./Post");
const Share = require("./Share");
const Like = require("./Like");
const Comment = require("./Comment");
const bcrypt = require("bcryptjs");
const Followers = require("./Follower");
const Following = require("./Following");
const { CustomError } = require("../lib/util");

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

UserSchema.methods.format = async function () {
  // Fetch the following list and populate the 'following' field
  const followingList = await Following.findOne({
    userId: this._id,
  }).populate("following", "-password -__v");

  // Fetch the follower list and populate the 'followers' field
  const followerList = await Followers.findOne({ userId: this._id }).populate(
    "followers",
    "-password -__v"
  );

  // Return formatted user data
  return {
    ...this._doc,
    following: followingList?.following || [],
    followers: followerList?.followers || [],
    posts: await this.getPosts(),
  };
};

UserSchema.methods.getPosts = async function () {
  // Fetch posts by the user and sort by creation date in descending order
  const posts = await Post.find({ author: this._id })
    .sort({
      createdAt: -1,
    })
    .populate("author", "-password -__v")
    .select("-__v");
  return await Promise.all(posts.map(async (post) => await post.format()));
};

module.exports = mongoose.model("User", UserSchema);
