const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpStatusCode, CustomError, getGravatar } = require("../lib/util");
const { isAuthenticated } = require("../middleware");

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
  const { name, username, password, email } = req.body;

  try {
    if (!name || !username || !password || !email) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Fields are required (name, username, password, email)"
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
      profilePicture: getGravatar(email),
    });

    const savedUser = await newUser.save();

    // Create JWT payload
    const payload = {
      user: {
        id: savedUser._id,
        username: savedUser.username,
      },
    };

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
      createdAt: savedUser.updatedAt,
    };
    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30h" }, // Token expires in 30 hour
      (err, token) => {
        if (err) throw err;
        res.status(HttpStatusCode.OK).json({ ...response, token });
      }
    );
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
      createdAt: user.updatedAt,
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
      { expiresIn: "30h" }, // Token expires in 30 hour
      (err, token) => {
        if (err) throw err;
        res.json({ ...response, token });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
