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
const Followers = require("../models/Follower");
const Following = require("../models/Following");
const fs = require("fs").promises;

class PostController {
  // Create a new post
  static async createPost(req, res, next) {
    const { content } = req.body;
    const filePath = req.file ? req.file.path : null;
    let fileType = null;
    let metadata = {};

    try {
      if (req.file) {
        fileType = req.file.mimetype.startsWith("image/") ? "image" : "video";
        metadata =
          fileType === "image"
            ? await getImageMetadata(filePath)
            : await getVideoMetadata(filePath);
      }

      // Ensure at least content or a file is provided
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
  }

  // Get post(s) - Fetch a specific post or all posts
  static async getPosts(req, res, next) {
    try {
      const { postId } = req.query;

      if (postId) {
        const detailedPost = await PostController.getPostById(postId);
        if (!detailedPost) {
          throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
        }

        return res.status(HttpStatusCode.OK).json(detailedPost);
      }

      // Fetch all posts if no specific postId is provided
      const posts = await PostController.getAllPosts();
      res.status(HttpStatusCode.OK).json(posts);
    } catch (error) {
      next(error);
    }
  }

  // Fetch a specific post by ID with associated data
  static async getPostById(postId) {
    const post = await Post.findById(postId)
      .populate({
        path: "author",
        select: "-password -__v",
      })
      .select("-__v");

    if (!post) return null;

    const [followerList, followingList, comments, postLikes, postShares] =
      await Promise.all([
        Followers.findOne({ userId: post.author._id }).populate(
          "followers",
          "-password -__v"
        ),
        Following.findOne({ userId: post.author._id }).populate(
          "following",
          "-password -__v"
        ),
        Comment.find({ postId }).populate({
          path: "author",
          select: "-password -__v",
        }),
        Like.find({ targetId: postId, targetType: "Post" }),
        Share.find({ postId }),
      ]);

    const postLikesUserIds = postLikes.map((like) => like.userId);
    const postSharesUserIds = postShares.map((share) => share.userId);

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Reply.find({ commentId: comment._id }).populate({
          path: "author",
          select: "-password -__v",
        });
        const commentLikes = await Like.find({
          targetId: comment._id,
          targetType: "Comment",
        });
        return {
          ...comment.toObject(),
          replies,
          likes: commentLikes.map((like) => like.userId),
        };
      })
    );

    return {
      ...post.toObject(),
      author: {
        ...post.author.toObject(),
        followers: followerList ? followerList.followers : [],
        following: followingList ? followingList.following : [],
      },
      comments: commentsWithReplies,
      shares: postSharesUserIds,
      likes: postLikesUserIds,
    };
  }

  // Fetch all posts with likes, shares, comments, and followers/following
  static async getAllPosts() {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "-password -__v",
      })
      .select("-__v");

    return Promise.all(
      posts.map(async (post) => {
        const [followerList, followingList] = await Promise.all([
          Followers.findOne({ userId: post.author._id }).populate(
            "followers",
            "-password -__v"
          ),
          Following.findOne({ userId: post.author._id }).populate(
            "following",
            "-password -__v"
          ),
        ]);

        const formattedPost = await post.format();
        return {
          ...formattedPost,
          author: {
            ...formattedPost.author._doc,
            followers: followerList ? followerList.followers : [],
            following: followingList ? followingList.following : [],
          },
        };
      })
    );
  }

  // Get user's own posts
  static async myPosts(req, res, next) {
    try {
      const posts = await Post.find({ author: req.user._id }).populate({
        path: "author",
        select: "-password -__v",
      });
      res.status(HttpStatusCode.OK).json(posts);
    } catch (error) {
      next(error);
    }
  }

  // Share a post
  static async sharePost(req, res, next) {
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
  }
}

module.exports = PostController;
