const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { CustomError, HttpStatusCode } = require("../lib/util");

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new CustomError(
        HttpStatusCode.UNAUTHORIZED,
        "Not authorized, no token provided"
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.user.id).select("-password");

    if (!user) {
      return next(
        new CustomError(
          HttpStatusCode.UNAUTHORIZED,
          "Not authorized, user not found"
        )
      );
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next(
      new CustomError(
        HttpStatusCode.UNAUTHORIZED,
        "Not authorized, token invalid or expired"
      )
    );
  }
};

module.exports = isAuthenticated;
