const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const { upload } = require("../config/multer");

const PostController = require("../controller/PostController");
const LikeController = require("../controller/LikeController");
const CommentController = require("../controller/CommentController");

router.get("/", PostController.getPosts);
router.get("/my-posts", isAuthenticated, PostController.myPosts);
router.post(
  "/",
  isAuthenticated,
  upload.single("media"),
  PostController.createPost
);
router.post("/:id/:type/like", isAuthenticated, LikeController.toggleLike);
router.post("/:postId/comments", isAuthenticated, CommentController.addComment);
router.post(
  "/comments/:commentId/replies",
  isAuthenticated,
  CommentController.replyToComment
);
router.post("/:postId/share", isAuthenticated, PostController.sharePost);

module.exports = router;
