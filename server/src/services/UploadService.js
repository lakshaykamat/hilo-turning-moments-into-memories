const multer = require("multer");
const path = require("path");
const { CustomError } = require("../lib/util");

// Service class for handling file uploads
class UploadService {
  #storage; // Private class field
  #upload; // Private class field

  constructor() {
    this.#storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/"); // Uploads directory
      },
      filename: (req, file, cb) => {
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    this.#upload = multer({
      storage: this.#storage,
      limits: { fileSize: 1024 * 1024 * 50 }, // Limit file size to 50MB
      fileFilter: this.#fileFilter,
    });
  }

  // Private method for file validation
  #fileFilter(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|webm/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new CustomError(
          400, // BAD_REQUEST
          "Only image and video files are allowed"
        )
      );
    }
  }

  // Public method to get multer upload middleware
  getUploadMiddleware() {
    return this.#upload;
  }
}

module.exports = UploadService;
