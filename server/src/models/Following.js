const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

// Index on userId for efficient querying
FollowingSchema.index({ userId: 1 });

// Method to add a following
FollowingSchema.methods.addFollowing = async function (followingId) {
  if (!this.following.includes(followingId)) {
    this.following.push(followingId);
    await this.save();
  }
  return this;
};

// Method to remove a following
FollowingSchema.methods.removeFollowing = async function (followingId) {
  const index = this.following.indexOf(followingId);
  if (index > -1) {
    this.following.splice(index, 1);
    await this.save();
  }
  return this;
};

const Following = mongoose.model("Following", FollowingSchema);

module.exports = Following;
