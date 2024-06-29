const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { CustomError } = require("../lib/util");

const isAuthenticated = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.user.id).select("-password");

      next();
    } catch (error) {
      next(new CustomError(401, "Not authorized, token failed"));
    }
  }

  if (!token) {
    next(new CustomError(401, "Not authorized, no token"));
  }
};

module.exports = isAuthenticated;
