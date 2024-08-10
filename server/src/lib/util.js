const axios = require("axios");
const os = require("os");
const gravatarUrl = require("gravatar-url");
const ffprobeStatic = require("ffprobe-static");
const ffprobe = require("ffprobe");
const sharp = require("sharp");

const getGravatar = (email) => {
  // Generate Gravatar URL
  const url = gravatarUrl(email, { size: 200, default: "identicon" });
  return url;
};

const HttpStatusCode = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

class CustomError extends Error {
  constructor(statusCode = 500, message = "Internal Server Error") {
    super(message);
    this.statusCode = statusCode;
  }
}

const getGeoLocation = async () => {
  try {
    const ipInfoResponse = await axios.get("https://ipinfo.io/json");
    return ipInfoResponse.data;
  } catch (err) {
    console.log(err);
  }
};

const getSystemInfo = async () => {
  // Get hostname of the device
  const hostname = os.hostname();

  // Get operating system platform
  const platform = os.platform();

  // Get operating system type
  const osType = os.type();

  // Get CPU architecture
  const arch = os.arch();
  return {
    hostname,
    platform,
    osType,
    arch,
  };
};

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${now.getDate()}-${
    now.getMonth() + 1
  }-${now.getFullYear()} ${hours}:${minutes}:${seconds}`;
}

const getImageMetadata = async (filePath) => {
  try {
    const imageMetadata = await sharp(filePath).metadata();
    return {
      width: imageMetadata.width,
      height: imageMetadata.height,
      format: imageMetadata.format,
    };
  } catch (error) {
    throw new CustomError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Error extracting image metadata"
    );
  }
};

const getVideoMetadata = async (filePath) => {
  try {
    const info = await new Promise((resolve, reject) => {
      ffprobe(filePath, { path: ffprobeStatic.path }, (err, info) => {
        if (err) {
          return reject(err);
        }
        resolve(info);
      });
    });

    const stream = info.streams[0];
    return {
      width: stream.width,
      height: stream.height,
      duration: stream.duration,
      aspectRatio: stream.display_aspect_ratio,
    };
  } catch (error) {
    throw new CustomError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Error extracting video metadata"
    );
  }
};
module.exports = {
  HttpStatusCode,
  getImageMetadata,
  getVideoMetadata,
  CustomError,
  getGeoLocation,
  getSystemInfo,
  getCurrentTime,
  getGravatar,
};
