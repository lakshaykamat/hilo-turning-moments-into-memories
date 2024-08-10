const { CustomError, HttpStatusCode } = require("../lib/util");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const post = await Post.findById(postId);

    if (!post) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Post not found");
    }

    const addedComment = await post.addComment(content, req.user._id);

    res.status(HttpStatusCode.OK).json(addedComment);
  } catch (error) {
    next(error);
  }
};
const replyToComment = async (req, res, next) => {
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
};

module.exports = { addComment, replyToComment };
