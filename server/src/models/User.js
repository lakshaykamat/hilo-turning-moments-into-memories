const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Post = require("./Post");
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
  password: { type: String, required: true, minlength: 6, maxlength: 20 },
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
  const posts = await Post.find({ author: this._id }).sort({
    createdAt: -1,
  });
  return posts;
};
module.exports = mongoose.model("User", UserSchema);
