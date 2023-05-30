const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

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

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
      });
});
app.get('/', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});