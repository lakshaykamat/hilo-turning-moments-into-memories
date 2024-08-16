const Post = require("../models/Post");
const {
  HttpStatusCode,
  CustomError,
  getImageMetadata,
  getVideoMetadata,
} = require("../lib/util");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const Share = require("../models/Share");
const fs = require("fs").promises;

const createPost = async (req, res, next) => {
  const { content } = req.body;
  const filePath = req.file ? req.file.path : null;
  let fileType = null;
  let metadata = {};

  try {
    if (req.file) {
      fileType = req.file.mimetype.startsWith("image/") ? "image" : "video";

      if (fileType === "image") {
        metadata = await getImageMetadata(filePath);
      } else if (fileType === "video") {
        metadata = await getVideoMetadata(filePath);
      }
    }

    // Ensure at least content or file is provided
    if (!content && !filePath) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Content or a file (image/video) is required"
      );
    }

    const post = new Post({
      author: req.user._id,
      content,
      media: {
        file: filePath,
        fileType,
        metadata,
      },
    });
    await post.save();

    res.status(HttpStatusCode.CREATED).json(post);
  } catch (error) {
    // Cleanup: Remove the uploaded file if an error occurs
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error("Error removing file during cleanup:", cleanupError);
      }
    }
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { postId } = req.query;

    if (postId) {
      // Fetch the post and its author (excluding password)
      const post = await Post.findById(postId)
        .populate({
          path: "author",
          select: "-password -__v", // Exclude password field
        })
        .select("-__v");

      if (!post) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
      }

      // Fetch comments for the post
      const comments = await Comment.find({ postId })
        .populate({
          path: "author",
          select: "-password -__v", // Exclude password field
        })
        .select("-__v");

      // Fetch likes for the post and map to user IDs
      const postLikes = await Like.find({
        targetId: postId,
        targetType: "Post",
      });
      const postLikesUserIds = postLikes.map((like) => like.userId);

      const postShares = await Share.find({ postId });
      const postSharesUserIds = postShares.map((share) => share.userId);

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await Reply.find({ commentId: comment._id })
            .populate({
              path: "author",
              select: "-password -__v", // Exclude password field
            })
            .select("-__v");
          const commentLikes = await Like.find({
            targetId: comment._id,
            targetType: "Comment",
          });
          const commentLikesUserIds = commentLikes.map((like) => like.userId);
          return {
            ...comment.toObject(),
            replies,
            likes: commentLikesUserIds,
          };
        })
      );

      // Prepare detailed post object
      const detailedPost = {
        ...post.toObject(),
        comments: commentsWithReplies,
        shares: postSharesUserIds,
        likes: postLikesUserIds, // List of user IDs who liked the post
      };

      return res.status(HttpStatusCode.OK).json(detailedPost);
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "-password -__v",
      })
      .select("-__v");

    const postWithLikesSharesAndComments = await Promise.all(
      posts.map(async (post) => await post.format())
    );

    res.status(HttpStatusCode.OK).json(postWithLikesSharesAndComments);
  } catch (error) {
    next(error);
  }
};

const myPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).populate({
      path: "author",
      select: "-password -__v", // Exclude password field
    });
    res.status(HttpStatusCode.OK).json(posts);
  } catch (error) {
    next(error);
  }
};

const sharePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
    }
    const share = new Share({ postId, userId: req.user._id });
    await share.save();
    res.status(HttpStatusCode.OK).json(share);
  } catch (error) {
    next(error);
  }
};
module.exports = { createPost, getPosts, sharePost, myPosts };
