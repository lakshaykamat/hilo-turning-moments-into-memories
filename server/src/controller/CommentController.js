const { CustomError, HttpStatusCode } = require("../lib/util");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Reply = require("../models/Reply");

class CommentController {
  // Add a comment to a post
  static async addComment(req, res, next) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const post = await Post.findById(postId);

      if (!post) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
      }

      // Add the comment to the post
      const addedComment = await post.addComment(content, req.user._id);

      // Fetch the comment and populate the author
      const populatedComment = await Comment.findById(addedComment._id).select(
        "-__v"
      );

      // Fetch likes and replies separately
      const likes = await Like.find({
        targetId: populatedComment._id,
        targetType: "Comment",
      });

      const replies = await Reply.find({
        commentId: populatedComment._id,
      });

      // Attach likes and replies to the comment object
      const commentWithLikesAndReplies = {
        ...populatedComment.toObject(),
        likes,
        replies,
      };

      res.status(HttpStatusCode.OK).json(commentWithLikesAndReplies);
    } catch (error) {
      next(error);
    }
  }

  // Reply to a comment
  static async replyToComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "Comment not found");
      }

      const addedReply = await comment.addReply(content, req.user._id);

      res.status(HttpStatusCode.OK).json(addedReply);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommentController;
