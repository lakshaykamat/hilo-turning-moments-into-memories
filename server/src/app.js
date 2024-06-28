const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const apiRoutes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const logger = require("./config/logger");
const { getGeoLocation, getSystemInfo } = require("./lib/util");
const connectDatabase = require("./config/mongoDB");
const PORT = process.env.PORT || 5000;

const app = express();
connectDatabase();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Example usage:
  const currentTime = getCurrentTime();
  console.log(currentTime);
  console.log(await getGeoLocation());
  console.log(await getSystemInfo());
  logger.info(`Server is running, ${currentTime}`);
});
