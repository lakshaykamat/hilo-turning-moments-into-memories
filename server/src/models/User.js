const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// Define UserSchema
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
  profilePicture: { type: String, maxlength: 255 }, // URL to profile picture
  bio: { type: String, maxlength: 500 }, // User bio
  status: {
    type: String,
    enum: ["online", "offline", "busy"],
    default: "offline",
  }, // User status
  role: { type: String, enum: ["user", "admin"], default: "user" }, // User role
  socialLinks: {
    facebook: { type: String, maxlength: 255 },
    twitter: { type: String, maxlength: 255 },
    linkedin: { type: String, maxlength: 255 },
    instagram: { type: String, maxlength: 255 },
  },
  lastLogin: { type: Date }, // Last login time
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of friends or contacts
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }], // Array of posts
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt field on save
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
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

// Static method to add a friend
UserSchema.statics.addFriend = async function (userId, friendId) {
  const user = await this.findById(userId);
  if (user && !user.friends.includes(friendId)) {
    user.friends.push(friendId);
    await user.save();
  }
  return user;
};

// Static method to remove a friend
UserSchema.statics.removeFriend = async function (userId, friendId) {
  const user = await this.findById(userId);
  if (user) {
    user.friends = user.friends.filter(
      (friend) => friend.toString() !== friendId
    );
    await user.save();
  }
  return user;
};

module.exports = mongoose.model("User", UserSchema);
