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

app.use('/:id',
  express.static(path.join(__dirname + '/public')));

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
    round:null,
    messages: [],
    answers: [],
    secrectWord: null,
    inGame: false
  },
  room2: {
    name: "room2",
    users: [],
    round:null,
    messages: [],
    answers: [],
    secrectWord: null,
    inGame: false
  },
  room3: {
    name: "room3",
    users: [],
    round:null,
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
    leaveRoom(socket)

  });

const leaveRoom =(socket) =>{
  console.log("leave room")
  
  for (const key in rooms) {
    const roomName =rooms[key]
   if (roomName.users.some(user=>user.socket.id === socket.id)) {

    socket.leave(key);
    roomName.users = roomName.users.filter((item) => item.socket !== socket);
  }
  
   if(roomName.users.length == 0){
    roomName.inGame = false
   }
  }
}

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
      socket.roomId = room
      rooms[room].users.push({ socket: socket, username: username, score: 0 });

      console.log("=====join-room" + rooms[room])
      console.log(`user ${socket.id} joined room ${room}`);
      // io.to(room).emit("receive-message", `${username} joined the room!`);
      console.log("=====join-room" + rooms[room].users)
    }

  });

  socket.on("start-game", (room) => {
    if (rooms[room]) {
      const userSelected = rooms[room].users[Math.floor(Math.random() * rooms[room].users.length)].username;
      const selectedWord = words[Math.floor(Math.random() * words.length)]
      rooms[room].inGame = true
      rooms[room].round = 1
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

  socket.on("round-over", ({sender, roomId, message}) => {
    const room = rooms[roomId]
    if (room) {
      //increment round number
      room.round++
      //select new drawer
      const userSelected = room.users[Math.floor(Math.random() * room.users.length)].username;
      //select new word
      const selectedWord = words[Math.floor(Math.random() * words.length)]
      //add score to user who guessed correctly
      // find the user in that array, add 1 to their score
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].username===sender){
          room.users[i].score++
        }        
      }
      console.log(`Score for ${room.users[i].username}: ${room.users[i].score}`)
      //clear the board
      //emit new board and new drawer with new secret word
      io.in(roomId).emit("selected-props", { userSelected, selectedWord })
    }
  } )

  socket.on("gameover", (room) => {
    if (rooms[room]) {
      //checking for user with most points
      let winner = {username:'', score:0}
      let users = rooms[room].users

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (user.score > winner.score) {
          winner.score = user.score
          winner.username = user.username
        }
      }
      io.in(room).emit('gameover', winner)
    }
  })

  socket.on("drawing", (data, room) => {
  
    if (room) {
      socket.in(room).emit("drawing", data)
    }
  });
});

sequelize.sync({ force: false}).then(() => {
  server.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}/`)
  );
});
