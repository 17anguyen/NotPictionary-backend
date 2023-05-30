const express = require('express');
const app = express();
const session = require('express-session');

const path = require('path');

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const routes = require('./controllers');
const PORT = 4000;
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

// const PORT = process.env.PORT || 3000;

const sess = {
    secret: 'Super secret secret',
    cookie: {},
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize
    })
  };

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });

// server.listen(3000, () => {
//   console.log('listening on *:3000');
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);


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
    
    socket.on('chat message', (msg,room) => {
      io.in(room).emit('chat message', msg);
      });

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});
app.get('/', (req, res) => {
  res.json({
      message: 'Hello world',
  });
});


sequelize.sync({ force: false }).then(() => {
    server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}/`));
  });