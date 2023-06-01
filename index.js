const express = require("express");
const app = express();

const path = require("path");

const sequelize = require("./config/connection");

const routes = require("./controllers");
const PORT = process.env.PORT || 4000;
const { User, Score } = require("./models");

const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());

const words = ["waffle",
    "bird",
    "cake",
    'house',
    'cookie',
    'couch',
    'car',
    'computer',
    'tree',
    'hand',
    'cheese',
    'snowman',
    'leaf',
    'king',
    'motorcycle',
    'sun',
    'shoe',
    'window',
    'crayon',
    'apple',
    'basketball',
    'snail',
    'bridge',
    'sunglasses',
    'coat']

const rooms = {
  room1: {
    name: "room1",
    users: [],
    messages: [],
    secrectWord: null
  },
  room2: {
    name: "room2",
    users: [],
    messages: [],
    secrectWord: null
  },
  room3: {
    name: "room3",
    users: [],
    messages: [],
    secrectWord: null
  },
};

io.on("connection", (socket) => {
  console.log(`${socket.id} user just connected!`);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("send-message", (data) => {
    rooms[data.room].messages.push(data);
    io.in(data.room).emit("receive-message", data);
  });
  socket.on("join-room", (room, username) => {
    socket.join(room);
    rooms[room].users.push({ socket: socket, username: username });
    console.log(`user ${socket.id} joined room ${room}`);
    io.to(room).emit("receive-message", `${username} joined the room!`);
  });



  socket.on("start-game", (room) => {
    // randomly select user from users array in that room
    // randomly select a prompt, assign to secretWord
    // emit event to inform the room of who the drawer is
    // emit to the drawer the secret word
  });

  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}/`)
  );
});
