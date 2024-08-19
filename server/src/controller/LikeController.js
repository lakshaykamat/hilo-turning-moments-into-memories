const { HttpStatusCode } = require("../lib/util");
const Like = require("../models/Like");

class LikeController {
  static async toggleLike(req, res, next) {
    const { type, id } = req.params;

    try {
      // Validate targetType
      if (!["Post", "Comment", "Reply"].includes(type)) {
        throw new CustomError(HttpStatusCode.BAD_REQUEST, "Invalid type");
      }
      const liked = await Like.toggleLike(req.user._id, id, type);
      res.status(HttpStatusCode.OK).json({ liked });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LikeController;
