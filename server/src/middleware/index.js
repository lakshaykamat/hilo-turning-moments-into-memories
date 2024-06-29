const errorHandler = require("./errorHandler");
const isAdmin = require("./isAdmin");
const isAuthenticated = require("./isAuthenticated");
const notFound = require("./notFound");

module.exports = {
  errorHandler,
  isAdmin,
  isAuthenticated,
  notFound,
};
