const express = require("express");
const { isAuthenticated } = require("../middleware");
const { upload } = require("../config/multer");
const userController = require("../controller/user");

const router = express.Router();

router.get("/", isAuthenticated, userController.find);

router
  .post("/register", userController.auth.register)
  .post("/login", userController.auth.login);

router.put(
  "/update",
  isAuthenticated,
  upload.single("image"),
  userController.update
);

module.exports = router;
