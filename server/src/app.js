require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const { errorHandler, notFound } = require("./middleware");
const logger = require("./config/logger");
const { getGeoLocation, getSystemInfo, getCurrentTime } = require("./lib/util");
const connectDatabase = require("./config/mongoDB");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5001;
const compression = require("compression");
const SocketService = require("./services/SocketService");

class ServerApp {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.connectDatabase();
    this.configureRoutes();
    this.configureMiddlewares();
    this.configureSocket();
    this.startServer();
  }

  connectDatabase() {
    connectDatabase();
  }

  configureMiddlewares() {
    this.app.use(compression());
    this.app.use("/uploads", express.static("uploads"));
    this.app.use(cors({ origin: true, credentials: true }));
    this.app.use(
      morgan("combined", {
        stream: fs.createWriteStream(path.join("logs", "access.log"), {
          flags: "a",
        }),
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  configureRoutes() {
    this.app.use("/", require("./routes/index"));
  }

  configureSocket() {
    this.socketService = new SocketService(this.server);
  }

  async startServer() {
    try {
      this.server.listen(PORT, async () => {
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
    } catch (error) {
      logger.error(`Error starting server: ${error.message}`);
    }
  }
}

// new ServerApp();

const app = express();
connectDatabase();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(compression()); // Enable gzip compression

app.use("/uploads", express.static("uploads"));
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

app.use("/", require("./routes/index"));
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
    io.to(message.conversationId).emit("newMessage", message);
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
module.exports = ServerApp;
