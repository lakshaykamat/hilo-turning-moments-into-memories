const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  HttpStatusCode,
  CustomError,
  getGravatar,
  getJWTToken,
} = require("../lib/util");
const bcrypt = require("bcryptjs");
const Followers = require("../models/Follower");
const Following = require("../models/Following");

class UserController {
  // Register a new user
  static async registerUser(req, res, next) {
    const { name, username, password, email } = req.body;

    try {
      if (!name || !username || !password || !email) {
        throw new CustomError(
          HttpStatusCode.BAD_REQUEST,
          "All fields are required"
        );
      }

      if (username !== username.toLowerCase() || /\s/.test(username)) {
        throw new CustomError(
          HttpStatusCode.BAD_REQUEST,
          "Username must be lowercase and contain no spaces"
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
      const followers = new Followers({ userId: savedUser._id });
      const following = new Following({ userId: savedUser._id });

      await Promise.all([followers.save(), following.save()]);

      const { password: _, __v, ...response } = savedUser.toObject();
      res.status(HttpStatusCode.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Log in a user
  static async loginUser(req, res, next) {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new CustomError(
          HttpStatusCode.UNAUTHORIZED,
          "Invalid credentials"
        );
      }

      const { password: _, __v, ...response } = user.toObject();
      const payload = { user: { id: user._id, username: user.username } };
      const token = await getJWTToken(payload, "300h");

      if (!token) {
        throw new CustomError(
          HttpStatusCode.BAD_REQUEST,
          "Failed to generate token"
        );
      }

      res.status(HttpStatusCode.OK).json({ ...response, token });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateUser(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "User not found");
      }

      if (req.file) {
        user.profilePicture = req.file.path;
      }

      const { name, username, email } = req.body;
      if (name) user.name = name;
      if (username) user.username = username;
      if (email) user.email = email;

      await user.save();
      const { password: _, __v, ...response } = user.toObject();
      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Find users by ID, username or get all users
  // static async findUsers(req, res, next) {
  //   try {
  //     const { userId, username } = req.query;

  //     if (userId) {
  //       const user = await User.findById(userId).select("-password -__v");
  //       if (!user) {
  //         return res
  //           .status(HttpStatusCode.NOT_FOUND)
  //           .json({ message: "User not found" });
  //       }
  //       const formattedUser = await user.format();
  //       res.status(HttpStatusCode.OK).json(formattedUser);
  //     } else if (username) {
  //       const users = await User.find({
  //         username: { $regex: username, $options: "i" },
  //         _id: { $ne: req.user._id },
  //       }).select("-password -__v");

  //       if (users.length === 0) {
  //         return res
  //           .status(HttpStatusCode.NOT_FOUND)
  //           .json({ message: "No users found" });
  //       }
  //       const formattedUser = await Promise.all(
  //         users.map(async (user) => await user.format())
  //       );
  //       res.status(HttpStatusCode.OK).json(formattedUser);
  //     } else {
  //       const allUsers = await User.find({ _id: { $ne: req.user._id } }).select(
  //         "-password -__v"
  //       );
  //       res.status(HttpStatusCode.OK).json(allUsers);
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async findUsers(req, res, next) {
    try {
      const { username } = req.query;

      if (!username) {
        // Return all users if no username query parameter is provided
        const allUsers = await User.find({ _id: { $ne: req.user._id } }).select(
          "-password -__v"
        );
        return res.status(HttpStatusCode.OK).json(allUsers);
      }

      // Check for an exact match first
      const exactUser = await User.findOne({
        username: username,
      }).select("-password -__v");

      if (exactUser) {
        // Format the exact match user and return a single object
        const formattedUser = await exactUser.format();
        return res.status(HttpStatusCode.OK).json(formattedUser);
      }

      // If no exact match, perform a partial match using regex
      const partialUsers = await User.find({
        username: { $regex: username, $options: "i" }, // Case-insensitive partial match
      }).select("-password -__v");

      if (partialUsers.length === 0) {
        return res.status(HttpStatusCode.OK).json([]);
      }

      // Format partial match users and return as an array
      const formattedUsers = await Promise.all(
        partialUsers.map(async (user) => await user.format())
      );

      res.status(HttpStatusCode.OK).json(formattedUsers);
    } catch (error) {
      next(error);
    }
  }

  // Follow or unfollow a user
  static async followUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (req.user._id.toString() === userId) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ error: true, message: "You cannot follow yourself." });
      }

      const userToFollow = await User.findById(userId);
      if (!userToFollow) {
        throw new CustomError(HttpStatusCode.NOT_FOUND, "User not found");
      }

      let followerList = await Followers.findOne({ userId });
      if (!followerList) {
        followerList = new Followers({ userId, followers: [] });
      }

      let followingList = await Following.findOne({ userId: req.user._id });
      if (!followingList) {
        followingList = new Following({ userId: req.user._id, following: [] });
      }

      const isFollowing = followingList.following.includes(userId);

      if (isFollowing) {
        followingList.following = followingList.following.filter(
          (id) => id.toString() !== userId
        );
        followerList.followers = followerList.followers.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      } else {
        followingList.following.push(userId);
        followerList.followers.push(req.user._id);
      }

      await Promise.all([followingList.save(), followerList.save()]);

      res.status(HttpStatusCode.OK).json({
        message: isFollowing
          ? "User unfollowed successfully"
          : "User followed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
