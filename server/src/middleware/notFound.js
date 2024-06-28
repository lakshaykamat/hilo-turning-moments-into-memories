const { HttpStatusCode } = require("../lib/util");

function notFound(req, res, next) {
  res
    .status(HttpStatusCode.NOT_FOUND)
    .send(`Page Not Found - ${req.originalUrl}`);
  next();
}
module.exports = notFound;
