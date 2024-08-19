const axios = require("axios");
const os = require("os");
const gravatarUrl = require("gravatar-url");
const ffprobeStatic = require("ffprobe-static");
const ffprobe = require("ffprobe");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const getGravatar = (email) => {
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
const getOTPMailHTML = (name, otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #FAFAFA;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #09090B;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #27272A;
    }
    .header h1 {
      margin: 10px 0 0 0;
      color: #FAFAFA;
      font-size: 28px;
      font-weight: 600;
    }
    .logo {
      width: 100px;
      height: auto;
      margin: 0 auto;
    }
    .content {
      font-size: 16px;
      line-height: 1.8;
      color: #FAFAFA;
      padding-top: 20px;
    }
    .otp {
      font-size: 26px;
      font-weight: 700;
      text-align: center;
      padding: 15px;
      background-color: #27272A;
      border-radius: 8px;
      margin: 20px 0;
      border-style: dashed;
      color: #FAFAFA;
      letter-spacing: 2px;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      font-size: 14px;
      color: #999;
      border-top: 1px solid #27272A;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- Inline SVG Logo -->
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#FAFAFA">
          <!-- Replace this SVG with your actual logo -->
          <circle cx="50" cy="50" r="50"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="30" font-family="Arial" fill="#09090B">SM</text>
        </svg>
      </div>
      <h1>Welcome to SyncMedia</h1>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>We are delighted to have you on board. To finalize your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
      <div class="otp">${otp}</div>
      <p>Please note that this OTP is valid for the next 10 minutes. For your security, do not share this code with anyone.</p>
      <p>If you did not request this, please disregard this email.</p>
      <p>Kind regards,<br>SyncMedia Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 SyncMedia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};
const getJWTToken = async (payload, expiresIn) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getJWTToken,
  HttpStatusCode,
  getImageMetadata,
  getVideoMetadata,
  CustomError,
  getGeoLocation,
  getSystemInfo,
  getCurrentTime,
  getGravatar,
};
