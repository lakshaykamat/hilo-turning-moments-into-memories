const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpStatusCode, CustomError } = require("../lib/util");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

/**
 * @route GET /api/v1/user
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

/**
 * @route POST /api/v1/user/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", async (req, res, next) => {
  const { name, username, password, email, profilePicture } = req.body;

  try {
    if (!name || !username || !password || !email || !profilePicture) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Fields are required (name, username, password, email, profilePicture)"
      );
    }

    let existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      throw new CustomError(
        HttpStatusCode.CONFLICT,
        "Username or email already exists"
      );
    }

    const newUser = new User({
      name,
      username,
      password,
      email,
      profilePicture,
    });

    const savedUser = await newUser.save();

    res.status(HttpStatusCode.CREATED).json(savedUser);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/user/login
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
      { expiresIn: "30h" }, // Token expires in 30 hour
      (err, token) => {
        if (err) throw err;
        res.json({ user, token });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
