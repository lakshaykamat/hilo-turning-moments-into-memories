const express = require("express");
const userRouter = require("./user");
const conversationRoutes = require("./conversation");
const postRoutes = require("./post");
const messagesRoutes = require("./message");
const adminRoutes = require("./admin");
const { isAuthenticated, isAdmin } = require("../middleware");
const User = require("../models/User");
const router = express.Router();

router.use("/api/v1/users", userRouter);
router.use("/api/v1/posts", postRoutes);
router.use("/api/v1/admin", isAdmin, adminRoutes);
router.use("/api/v1/messages", isAuthenticated, messagesRoutes);
router.use("/api/v1/conversations", isAuthenticated, conversationRoutes);

router.get("/", async (req, res) => {
  const users = await User.find();
  res.render("index", {
    title: "Welcome",
    message: "Hello there!",
    users,
  });
});

// Route for displaying individual user details
router.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (user) {
    const fuser = await user.format();
    res.render("user", { user: fuser });
  } else {
    res.status(404).send("User not found");
  }
});
module.exports = router;
