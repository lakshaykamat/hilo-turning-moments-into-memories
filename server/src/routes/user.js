const express = require("express");
const { isAuthenticated } = require("../middleware");
const { upload } = require("../config/multer");
const UserController = require("../controller/UserController");

const router = express.Router();

router.get("/", isAuthenticated, UserController.findUsers);

router
  .post("/register", UserController.registerUser)
  .post("/login", UserController.loginUser)
  .post("/follow/:userId", isAuthenticated, UserController.followUser);

router.put(
  "/update",
  isAuthenticated,
  upload.single("image"),
  UserController.updateUser
);

module.exports = router;
