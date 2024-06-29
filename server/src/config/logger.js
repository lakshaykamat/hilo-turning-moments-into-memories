const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");
const { combine, timestamp, printf, colorize } = format;

// Create logs directory if it doesn't exist
const logsDir = "logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(colorize(), timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logsDir, "application.log") }),
  ],
});

module.exports = logger;
