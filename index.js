const express = require('express');
const app = express();
const session = require('express-session');

const path = require('path');

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const routes = require('./controllers');
const http = require('http');
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

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

sequelize.sync({ force: false }).then(() => {
    server.listen(PORT, () => console.log('Now listening'));
  });
  