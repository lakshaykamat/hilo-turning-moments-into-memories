const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 5001;
const accessLogStream = fs.createWriteStream(path.join("logs", "access.log"), {
  flags: "a",
});

module.exports = { PORT, accessLogStream };
