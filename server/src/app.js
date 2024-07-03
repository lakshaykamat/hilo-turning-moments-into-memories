require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const apiRoutes = require("./routes/index");
const { errorHandler, notFound } = require("./middleware");
const logger = require("./config/logger");
const { getGeoLocation, getSystemInfo, getCurrentTime } = require("./lib/util");
const connectDatabase = require("./config/mongoDB");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;

const app = express();
connectDatabase();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors({ origin: true, credentials: true }));

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://synctalk.vercel.app",
    ], // You can restrict this to your front-end URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle join room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle leave room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  // Handle send message
  socket.on("sendMessage", (message) => {
    io.to(message.chatRoom).emit("newMessage", message);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, async () => {
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
