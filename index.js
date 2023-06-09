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
const { start } = require("repl");
const { Socket } = require("dgram");


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

app.use('/:id',
  express.static(path.join(__dirname + '/public')));

const io = new Server(server, {
  cors: {
     origin: "http://localhost:3000",
    // origin: "https://doodledash.netlify.app/",
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
  'banana',
  'tree',
  'hand',
  'cheese',
  'snowman',
  'leaf',
  'king',
  'motorcycle',
  'television',
  'medicine',
  'lamp',
  'ferry',
  'fairy',
  'flower',
  'candle',
  'guitar',
  'sushi',
  'mountain',
  'cactus',
  'fan',
  'camp fire',
  'cat',
  'lizard',
  'snake',
  'toast',
  'coffee',
  'joe',
  'dog',
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
    round: 0,
    messages: [],
    answers: [],
    secretWord: null,
    inGame: false
  },
  room2: {
    name: "room2",
    users: [],
    round: 0,
    messages: [],
    answers: [],
    secretWord: null,
    inGame: false
  },
  room3: {
    name: "room3",
    users: [],
    round: 0,
    messages: [],
    answers: [],
    secretWord: null,
    inGame: false
  },
};

io.on("connection", (socket) => {
  console.log(`${socket.id} user just connected!`);
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    leaveRoom(socket)

  });

  const leaveRoom = (socket) => {
    for (const key in rooms) {
      const roomName = rooms[key]
      if (roomName.users.some(user => user.socket.id === socket.id)) {
        socket.leave(key);
        roomName.users = roomName.users.filter((item) => item.socket !== socket);
      }
      if (roomName.users.length == 0) {
        roomName.inGame = false
        roomName.round = 0
      }
    }
  }

  socket.on("send-message", (data) => {
    rooms[data.room].messages.push(data);
    io.in(data.room).emit("receive-message", data);
  });

  socket.on("send-answers", (data) => {

    rooms[data.room].answers.push(data);
    socket.in(data.room).emit("receive-answer", data);
    if (data.message === rooms[data.room].secretWord) {
      io.in(data.room).emit("round-over", data)
      for (let i = 0; i < rooms[data.room].users.length; i++) {
        if (rooms[data.room].users[i].username === data.sender) {
          rooms[data.room].users[i].score++
        }
      }


    }
  })
  socket.on("join-room", (room, username) => {
    if (room !== "" && rooms[room]) {
      socket.join(room);
      socket.roomId = room
      rooms[room].users.push({ socket: socket, username: username, score: 0 });
      io.to(room).emit("user-join", username);
    }

  });

  socket.on("start-game", (room) => {
    if (rooms[room]) {
      const userSelected = rooms[room].users[Math.floor(Math.random() * rooms[room].users.length)].username;
      const selectedWord = words[Math.floor(Math.random() * words.length)]
      rooms[room].inGame = true
      rooms[room].round++
      rooms[room].secretWord = selectedWord
      io.in(room).emit("selected-props", { userSelected, selectedWord, round: rooms[room].round });
    }
  });

  socket.on("round-over", ({ sender, room, message }, isCorrect) => {
    const roomObj = rooms[room]
    if (roomObj) {
      //increment round number
      // room.round++
      //select new drawer
      const userSelected = roomObj.users[Math.floor(Math.random() * roomObj.users.length)].username;
      //select new word
      const selectedWord = words[Math.floor(Math.random() * words.length)]
      //add score to user who guessed correctly
      // find the user in that array, add 1 to their score
      for (let i = 0; i < roomObj.users.length; i++) {
        if (roomObj.users[i].username === sender) {
          roomObj.users[i].score++
        }
      }
      //clear the board
      //emit new board and new drawer with new secret word
      io.in(roomId).emit("selected-props", { userSelected, selectedWord })
    }
  })

  socket.on("gameover", (room) => {
    console.log("game over out")
    if (rooms[room]) {
      console.log("game over in")
      rooms[room].inGame = false
      //checking for user with most points
      let winner = { username: '', score: 0 }
      let users = rooms[room].users

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (user.score > winner.score) {
          winner.score = user.score
          winner.username = user.username
        }
      }
      io.in(room).emit('game-over', winner)
    }
  })
  socket.on("countdown", (start, room) => {
    io.in(room).emit("setCountdown", start);
    setTimeout(() => {
      io.in(room).emit("setCountdown", false);
    }, 40000);

  })

  socket.on("drawing", (data, room) => {

    if (room) {
      io.in(room).emit("drawing", data)
    }
  });
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}/`)
  );
});
