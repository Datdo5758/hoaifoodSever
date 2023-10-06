const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const orderRoutes = require("./routes/order");

require("dotenv").config();
const port = process.env.PORT || 8000;
const mongoUrl = process.env.URLMONGO;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(cors());
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("images")
);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(userRouter);
app.use(adminRouter);
app.use("/chatrooms", chatRoutes);
app.use(orderRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;

  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    const server = app.listen(port);
    const io = require("./socket").init(server);

    io.on("connection", socket => {
      console.log("Client connected");

      // Xử lý khi máy khách gửi tin nhắn
      socket.on("send_message", message => {
        console.log("Received message:", message);

        // Gửi lại tin nhắn cho tất cả các máy khách kết nối
        io.emit("receive_message", message);
      });
    });
    io.on("disconnected", socket => {
      console.log("disconnected");
    });
  })
  .catch(err => console.log(err));
