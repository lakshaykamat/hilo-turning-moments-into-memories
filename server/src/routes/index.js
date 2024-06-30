const express = require("express");
const userRouter = require("./user");
const chatRoomRouter = require("./chatroom");
const postRoutes = require("./post");
const messagesRoutes = require("./message");
const adminRoutes = require("./admin");
const { isAuthenticated, isAdmin } = require("../middleware");
const router = express.Router();

router.use("/users", userRouter);
router.use("/posts", postRoutes);
router.use("/admin", isAdmin, adminRoutes);
router.use("/messages", isAuthenticated, messagesRoutes);
router.use("/chatrooms", isAuthenticated, chatRoomRouter);

module.exports = router;
