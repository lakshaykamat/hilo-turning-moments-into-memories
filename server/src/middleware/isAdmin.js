const { CustomError, HttpStatusCode } = require("../lib/util");

const isAdmin = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    if (name == process.env.ADMIN_NAME && password == process.env.ADMIN_PASS) {
      next();
    } else {
      throw new CustomError(HttpStatusCode.FORBIDDEN, "Invaild User.");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = isAdmin;
