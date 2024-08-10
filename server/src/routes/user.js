const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpStatusCode, CustomError, getGravatar } = require("../lib/util");
const { isAuthenticated } = require("../middleware");
const { upload } = require("../config/multer");

const router = express.Router();

/**
 * @route GET /api/v1/users
 * @description Get all users except the logged-in user
 * @access Private
 */
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.user.id } });
    res.status(HttpStatusCode.OK).json(allUsers);
  } catch (error) {
    next(error);
  }
});
// Search users by username
router.get("/search", isAuthenticated, async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Username query parameter is required",
      });
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" }, // Case-insensitive search
      _id: { $ne: req.user._id }, // Exclude the authenticated user
    }).select("username profilePicture name");

    if (users.length === 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "No users found",
      });
    }

    res.status(HttpStatusCode.OK).json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/users/:userId
 * @description Get a user by ID and populate posts
 * @access Private
 */
router.get("/:userId", isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("posts").sort();

    if (!user) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Sort the posts by createdAt field in descending order
    user.posts.sort((a, b) => b.createdAt - a.createdAt);

    // Format the posts
    const formattedPosts = await Promise.all(
      user.posts.map(async (post) => await post.formatPost())
    );

    const formattedUser = {
      ...user.toObject(),
      posts: formattedPosts,
    };

    res.status(HttpStatusCode.OK).json(formattedUser);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/users/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", async (req, res, next) => {
  const { name, username, password, email } = req.body;

  try {
    // Validate required fields
    if (!name || !username || !password || !email) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Fields are required (name, username, password, email)"
      );
    }

    // Check if username contains spaces or is not lowercase
    if (username !== username.toLowerCase() || /\s/.test(username)) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Username must be lowercase and cannot contain spaces"
      );
    }

    // Check if username or email already exists
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      throw new CustomError(
        HttpStatusCode.CONFLICT,
        "Username or email already exists"
      );
    }

    // Create new user instance
    const newUser = new User({
      name,
      username,
      password,
      email,
      profilePicture: getGravatar(email),
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create JWT payload
    const payload = {
      user: {
        id: savedUser._id,
        username: savedUser.username,
      },
    };

    // Generate JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30h" }, // Token expires in 30 hours
      (err, token) => {
        if (err) throw err;
        // Prepare response object
        const response = {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          username: savedUser.username,
          profilePicture: savedUser.profilePicture,
          status: savedUser.status,
          role: savedUser.role,
          friends: savedUser.friends,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
          token, // Attach token to response
        };
        // Respond with user data and token
        res.status(HttpStatusCode.OK).json(response);
      }
    );
  } catch (error) {
    // Handle errors
    next(error);
  }
});

/**
 * @route POST /api/v1/users/login
 * @description Login user and return JWT token
 * @access Public
 */
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check if the username exists
    const user = await User.findOne({ username });

    if (!user) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "User not found");
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new CustomError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      status: user.status,
      role: user.role,
      friends: user.friends,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        username: user.username,
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30h" }, // Token expires in 30 hours
      (err, token) => {
        if (err) throw err;
        res.json({ ...response, token });
      }
    );
  } catch (error) {
    next(error);
  }
});

router.put(
  "/change-profile-picture",
  isAuthenticated,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "User not found");
      }

      if (!req.file) {
        throw new CustomError(
          HttpStatusCode.BAD_REQUEST,
          "No image file provided"
        );
      }

      // Optionally, you can add logic to delete the old profile picture if stored on the server

      user.profilePicture = req.file.path; // Save the file path to the user profile
      await user.save();

      res.status(HttpStatusCode.OK).json({
        message: "Profile picture updated successfully",
        profilePicture: user.profilePicture,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
