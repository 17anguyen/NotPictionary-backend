const express = require('express');
const app = express();

const path = require('path');

const sequelize = require('./config/connection');

const routes = require('./controllers');
const PORT = process.env.PORT || 4000;
const {User,Score} = require('./models')

const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',routes);


const io = new Server(server,{
    cors:{
        origin: "http://localhost:3000"
    }
});


app.use(cors());

io.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);
    
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
    
    socket.on('send-message', (data) => {
      socket.to(data.room).emit('receive-message', data);
      });
    socket.on("join-room", room =>{
      socket.join(room)
      console.log(`user ${socket.id} joined room ${room}`)
    })

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});

sequelize.sync({ force: false }).then(() => {
    server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}/`));
  });