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

app.use(cors());

app.get("/check-rooms", (req, res) => {
  console.log("here")
  // loop over rooms object, check which ones are open
  try {
    const freeRooms = []
    for (const key in rooms) {
      if (!rooms[key].inGame) {
        freeRooms.push(rooms[key].name)
      }
    }
    // return array of open rooms
    console.log(freeRooms)
    res.status(200).json(freeRooms)

  } catch (err) {
    res.status(400).json(err)
  }
})

app.use("/", routes);



const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});


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
    answers: [],
    secrectWord: null,
    inGame: false
  },
  room2: {
    name: "room2",
    users: [],
    messages: [],
    answers: [],
    secrectWord: null,
    inGame: false
  },
  room3: {
    name: "room3",
    users: [],
    messages: [],
    answers: [],
    secrectWord: null,
    inGame: false
  },
};

io.on("connection", (socket) => {
  console.log(`${socket.id} user just connected!`);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
   

  });

  socket.on("send-message", (data) => {
    console.log(data)
    rooms[data.room].messages.push(data);
    socket.in(data.room).emit("receive-message", data);
    console.log("messages=====")

  });

  socket.on("send-answers", (data) => {
    rooms[data.room].answers.push(data);
    console.log(JSON.stringify(data))
    socket.in(data.room).emit("receive-answer", data);
    console.log("answers=====" + data)
  })
  socket.on("join-room", (room, username) => {
    if (room !== "" && rooms[room]) {
      socket.join(room);
      rooms[room].users.push({ socket: socket, username: username });
      
      console.log("=====join-room" + rooms[room])
      console.log(`user ${socket.id} joined room ${room}`);
      // io.to(room).emit("receive-message", `${username} joined the room!`);
    }

  });

  socket.on("start-game", (room) => {
    if (rooms[room]) {
      const userSelected = rooms[room].users[Math.floor(Math.random() * rooms[room].users.length)].username;
      const selectedWord = words[Math.floor(Math.random() * words.length)]
      rooms[room].inGame = true
      console.log("++++++++++" + rooms[room].inGame)
      console.log(selectedWord)
      console.log(rooms[room].users)
      console.log(userSelected)
      io.in(room).emit("selected-props", { userSelected, selectedWord });

    }

    // randomly select a prompt, assign to secretWord
    //const randomWord = words[Mathfloor]
    // emit event to inform the room of who the drawer is
    //io.to(room).emit("selected-player",``)
    // emit to the drawer the secret word
  });

  socket.on("drawing", (data, room) => {
    console.log("=======" + room)
    if (room){
      socket.in(room).emit("drawing", data)
    }
  });
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}/`)
  );
});
