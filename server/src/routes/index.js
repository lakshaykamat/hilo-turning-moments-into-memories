const express = require("express");
const userRouter = require("./user");
const chatRoomRouter = require("./chatroom");
const messagesRoutes = require("./message");
const adminRoutes = require("./admin");
const { isAuthenticated, isAdmin } = require("../middleware");
const router = express.Router();

router.use("/user", userRouter);
router.use("/admin", isAdmin, adminRoutes);
router.use("/messages", isAuthenticated, messagesRoutes);
router.use("/chatrooms", isAuthenticated, chatRoomRouter);

module.exports = router;
