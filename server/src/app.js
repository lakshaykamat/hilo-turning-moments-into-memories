require("dotenv").config();
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
const path = require("path");
const fs = require("fs");
const PORT = process.env.PORT || 5000;

const app = express();
connectDatabase();

app.use(cors());

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join("logs", "access.log"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));
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
    return `${now.getDate()}-${
      now.getMonth() + 1
    }-${now.getFullYear()} ${hours}:${minutes}:${seconds}`;
  }

  const getGeo = await getGeoLocation();
  const getSys = await getSystemInfo();
  logger.info(
    `Server running http://127.0.0.1:${PORT}/ at ${getCurrentTime()} hostname:${
      getSys.hostname
    } platform:${getSys.platform} osType:${getSys.osType} IP:${
      getGeo.ip
    } city:${getGeo.city},${getGeo.region},${getGeo.country} Timezone:${
      getGeo.timezone
    } Org:${getGeo.org}`
  );
});
