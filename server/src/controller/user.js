const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");
const { HttpStatusCode, CustomError, getGravatar } = require("../lib/util");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res, next) => {
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

    // Remove password field from user object before sending response
    const { password: _, __v, ...response } = savedUser.toObject();

    res.status(HttpStatusCode.CREATED).json({ ...response });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

const loginUser = async (req, res, next) => {
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

    // Remove password field from user object before sending response
    const { password: _, __v, ...response } = user.toObject();

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
      { expiresIn: "300h" }, // Token expires in 30 hours
      (err, token) => {
        if (err) throw err;
        res.json({ ...response, token });
      }
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "User not found");
    }

    // Handle profile picture update
    if (req.file) {
      user.profilePicture = req.file.path; // Save the file path to the user profile
    }

    // Update other fields if provided
    const { name, username, email, password } = req.body;
    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    // Remove password and __v before sending response
    const { password: _, __v, ...response } = user.toObject();

    res.status(HttpStatusCode.OK).json({
      message: "User updated successfully",
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

// Combined function for finding and searching users, and getting a user by ID
const findUsers = async (req, res, next) => {
  try {
    const { userId, username } = req.query;

    if (userId) {
      // Get user by ID
      const user = await User.findById(userId).select("-password -__v");

      if (!user) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "User not found" });
      }

      res.status(HttpStatusCode.OK).json({
        ...user.toObject(),
        posts: await user.getPosts(),
      });
    } else if (username) {
      // Search users by username
      const users = await User.find({
        username: { $regex: username, $options: "i" },
        _id: { $ne: req.user._id },
      }).select("-password -__v");

      if (users.length === 0) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "No users found" });
      }

      res.status(HttpStatusCode.OK).json(users);
    } else {
      // Get all users excluding the authenticated user
      const allUsers = await User.find({ _id: { $ne: req.user._id } }).select(
        "-password -__v"
      );
      res.status(HttpStatusCode.OK).json(allUsers);
    }
  } catch (error) {
    next(error);
  }
};

const userController = {
  auth: {
    register: registerUser,
    login: loginUser,
  },
  update: updateUser,
  find: findUsers,
};
module.exports = userController;
