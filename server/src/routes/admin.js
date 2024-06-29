const express = require("express");
const path = require("path");
const fs = require("fs");
const { HttpStatusCode, CustomError } = require("../lib/util");

const router = express.Router();

/**
 * @route GET /api/v1/logs/application
 * @description Display application logs
 * @access Private
 */
router.get("/logs/application", async (req, res, next) => {
  const logFilePath = path.join("./logs/application.log");

  try {
    // Check if the log file exists
    if (!fs.existsSync(logFilePath)) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Log file not found");
    }

    // Read the log file content
    const logs = fs.readFileSync(logFilePath, "utf-8");

    // Send the log file content as a response
    res.status(HttpStatusCode.OK).send(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/logs/server
 * @description Display server logs
 * @access Private
 */
router.get("/logs/server", async (req, res, next) => {
  const logFilePath = path.join("./logs/access.log");

  try {
    // Check if the log file exists
    if (!fs.existsSync(logFilePath)) {
      throw new CustomError(HttpStatusCode.NOT_FOUND, "Log file not found");
    }

    // Read the log file content
    const logs = fs.readFileSync(logFilePath, "utf-8");

    // Send the log file content as a response
    res.status(HttpStatusCode.OK).send(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
