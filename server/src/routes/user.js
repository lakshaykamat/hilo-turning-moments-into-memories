const express = require("express");
const logger = require("../config/logger");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { HttpStatusCode, CustomError } = require("../lib/util");

const router = express.Router();

/**
 * @route GET /api/v1/users
 * @description Get all users
 * @access Public
 */
router.get("/", async (req, res, next) => {
  try {
    // Fetch all users from the database
    const allUsers = await User.find();

    // Respond with a JSON array of all users
    res.status(HttpStatusCode.OK).json(allUsers);
  } catch (error) {
    // Pass any errors to the error-handling middleware
    next(error);
  }
});

/**
 * @route POST /api/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", async (req, res, next) => {
  const { name, username, password, email, profilePicture } = req.body;

  try {
    if (!name || !username || !password || !email || !profilePicture) {
      throw new CustomError(
        HttpStatusCode.BAD_REQUEST,
        "Fields are required (name,username,password,email,avatar"
      );
    }
    // Check if the username or email already exists
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      throw CustomError(
        HttpStatusCode.CONFLICT,
        "Username or email already exists"
      );
    }

    // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({
      name,
      username,
      password,
      email,
      profilePicture,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.status(HttpStatusCode.CREATED).json(savedUser);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
