const mongoose = require("mongoose");
const User = require("./User");
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
      likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
  shares: { type: Number, default: 0 }, // Number of shares
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
  return this.findOne({ _id: postId }).populate("author", [
    "username",
    "name",
    "profilePicture",
  ]);
};

// Instance method to format post data
PostSchema.methods.formatPost = async function () {
  const author = await User.findById(this.author._id).select([
    "username",
    "profilePicture",
    "name",
  ]);
  const post = {
    id: this._id,
    content: this.content,
    author: author,
    likes: this.likes,
    shares: this.shares,
    comments: [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  for (const comment of this.comments) {
    const author = await User.findById(comment.author).select([
      "username",
      "profilePicture",
      "name",
    ]);
    const formattedComment = {
      id: comment._id,
      content: comment.content,
      author: {
        id: comment.author,
        username: author.username,
        profilePicture: author.profilePicture,
        name: author.name,
      },
      likes: comment.likes,
      replies: [],
      createdAt: comment.createdAt,
    };

    for (const reply of comment.replies) {
      const replyAuthor = await User.findById(reply.author).select([
        "username",
        "name",
        "profilePicture",
      ]);
      const formattedReply = {
        id: reply._id,
        content: reply.content,
        author: {
          id: reply.author,
          username: replyAuthor.username,
          profilePicture: replyAuthor.profilePicture,
          name: replyAuthor.name,
        },
        likes: reply.likes,
        createdAt: reply.createdAt,
      };
      formattedComment.replies.push(formattedReply);
    }

    post.comments.push(formattedComment);
  }

  return post;
};

// Instance method to add a comment to the post
PostSchema.methods.addComment = async function (commentContent, authorId) {
  const comment = {
    content: commentContent,
    author: authorId,
  };
  this.comments.push(comment);
  await this.save();
  return this.comments[this.comments.length - 1]; // Return the newly added comment
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
  const newReply = {
    content: replyContent,
    author: authorId,
  };
  comment.replies.push(newReply);
  await this.save();

  // Populate the newly added reply's author field
  await this.populate({
    path: "comments.replies.author",
    select: "username profilePicture name",
    match: { _id: authorId },
  });

  // Retrieve the newly added reply
  const addedReply = comment.replies[comment.replies.length - 1];

  return {
    id: addedReply._id,
    content: addedReply.content,
    author: {
      username: addedReply.author.username,
      profilePicture: addedReply.author.profilePicture,
      name: addedReply.author.name,
    },
    createdAt: addedReply.createdAt,
    likes: addedReply.likes,
  };
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

// Instance method to toggle like/unlike on a post
PostSchema.methods.togglePostLike = async function (userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    // User has not liked the post, add like
    this.likes.push(userId);
  } else {
    // User has already liked the post, remove like
    this.likes.splice(index, 1);
  }

  await this.save();
};

// Create Post model
const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
