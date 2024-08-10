const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const { upload } = require("../config/multer");

const {
  createPost,
  getPosts,
  sharePost,
  myPosts,
} = require("../controller/post");
const { addComment, replyToComment } = require("../controller/comment");
const { toggleLike } = require("../controller/like");

router.get("/", getPosts);
router.get("/my-posts", isAuthenticated, myPosts);
router.post("/", isAuthenticated, upload.single("media"), createPost);
router.post("/:id/:type/like", isAuthenticated, toggleLike);
router.post("/:postId/comments", isAuthenticated, addComment);
router.post("/comments/:commentId/replies", isAuthenticated, replyToComment);
router.post("/:postId/share", isAuthenticated, sharePost);

module.exports = router;
