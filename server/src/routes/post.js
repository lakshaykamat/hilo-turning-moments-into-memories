const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { HttpStatusCode, CustomError } = require("../lib/util");
const { isAuthenticated } = require("../middleware");
const User = require("../models/User");

/**
 * @route POST /api/v1/post
 * @description Create a new post
 * @access Private
 * @param {string} content - The content of the post.
 * @returns {object} - 201 Created post object.
 * @throws {CustomError} - If there are validation errors or database issues.
 */
router.post("/", isAuthenticated, async (req, res, next) => {
  const { content } = req.body;
  try {
    const post = new Post({
      content,
      author: req.user.id,
    });
    await post.save();

    const user = await User.findById(req.user.id);
    user.posts.push(post._id);
    await user.save();

    res.status(HttpStatusCode.CREATED).json(await post.formatPost());
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/post
 * @description Display all posts
 * @access Public
 * @returns {object} - 201 Array of  post objects.
 * @throws {CustomError} - If there are database issues.
 */
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll().sort({ createdAt: -1 });
    const formattedPosts = await Promise.all(
      posts.map((post) => post.formatPost())
    );

    res.status(HttpStatusCode.OK).json(formattedPosts);
  } catch (error) {
    next(error);
  }
});
/**
 * @route GET /api/v1/post
 * @description Display all posts
 * @access Public
 * @returns {object} - 201 Array of  post objects.
 * @throws {CustomError} - If there are database issues.
 */
router.get("/user", isAuthenticated, async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({
      createdAt: -1,
    });
    const formattedPosts = await Promise.all(
      posts.map((post) => post.formatPost())
    );

    res.status(HttpStatusCode.OK).json(formattedPosts);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/post/:postId
 * @description Display a specific post by ID
 * @access Public
 * @param {string} postId - Id of the post.
 * @returns {object} - 201 Returns a post object.
 * @throws {CustomError} - If there are database issues.
 */
router.get("/:postId", async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
    }
    res.status(HttpStatusCode.OK).json(await post.formatPost());
  } catch (error) {
    next(error);
  }
});
/**
 * @route GET /api/v1/post/:postId/like
 * @description Display a specific post by ID
 * @access Public
 * @param {string} postId - Id of the post.
 * @returns {object} - 201 Returns a post object.
 * @throws {CustomError} - If there are database issues.
 */
router.post("/:postId/like", isAuthenticated, async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
    }
    await post.togglePostLike(req.user._id);
    res.status(HttpStatusCode.OK).json({ count: post.likes.length });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/post/:postId/comments
 * @description Add comment to a post
 * @access Private
 *
 * @param {string} content - The content of the comment.
 * @param {string} postId - The ID of the post to add the comment to.
 *
 * @returns {object} 200 - Success message indicating the comment was added.
 * @throws {CustomError} 404 - Not Found: Post with the specified ID not found.
 * @throws {CustomError} 400 - Bad Request: Content is missing or empty.
 * @throws {CustomError} 500 - Internal Server Error: Database operation failed.
 */
router.post("/:postId/comments", isAuthenticated, async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
    }
    const addedComment = await post.addComment(content, req.user._id);

    // Fetch the author's username for the added comment
    const author = await User.findById(addedComment.author).select("username");
    const formattedComment = {
      id: addedComment._id,
      content: addedComment.content,
      author: {
        id: addedComment.author,
        username: author.username,
        profilePicture: author.profilePicture,
      },
      likes: addedComment.likes,
      replies: [],
      createdAt: addedComment.createdAt,
    };

    res.status(HttpStatusCode.OK).json(formattedComment);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/post/:postId/comments/:commentId/replies
 * @description Add Reply to a comment
 * @access Private
 */
router.post(
  "/:postId/comments/:commentId/replies",
  isAuthenticated,
  async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
      }
      await post.addReply(commentId, content, req.user._id);
      res
        .status(HttpStatusCode.OK)
        .json({ message: "Reply added successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/post/:postId/comments/:commentId/like
 * @description Toggle like/unlike on a comment
 * @access Private
 */
router.post(
  "/:postId/comments/:commentId/like",
  isAuthenticated,
  async (req, res, next) => {
    const { postId, commentId } = req.params;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
      }
      await post.toggleLike(commentId, req.user.id);
      res
        .status(HttpStatusCode.OK)
        .json({ message: "Like toggled successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/post/:postId/comments/:commentId/replies/:replyId/like
 * @description Toggle like/unlike on a reply
 * @access Private
 */
router.post(
  "/:postId/comments/:commentId/replies/:replyId/like",
  isAuthenticated,
  async (req, res, next) => {
    const { postId, commentId, replyId } = req.params;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
      }
      await post.toggleReplyLike(commentId, replyId, req.user._id);
      res
        .status(HttpStatusCode.OK)
        .json({ message: "Reply like toggled successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/post/:postId/share
 * @description Share post to and increase share count on post
 * @access Private
 */
router.post("/:postId/share", isAuthenticated, async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
    }
    post.shares += 1;
    await post.save();
    res.status(HttpStatusCode.OK).json({ message: `Shared: ${post.shares}` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
