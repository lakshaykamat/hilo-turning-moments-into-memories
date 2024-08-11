const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowersSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

// Index on userId for efficient querying
FollowersSchema.index({ userId: 1 });

// Method to add a follower
FollowersSchema.methods.addFollower = async function (followerId) {
  if (!this.followers.includes(followerId)) {
    this.followers.push(followerId);
    await this.save();
  }
  return this;
};

// Method to remove a follower
FollowersSchema.methods.removeFollower = async function (followerId) {
  const index = this.followers.indexOf(followerId);
  if (index > -1) {
    this.followers.splice(index, 1);
    await this.save();
  }
  return this;
};

const Followers = mongoose.model("Followers", FollowersSchema);

module.exports = Followers;
