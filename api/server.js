const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session'); 
const KnexSessionStore = require('connect-session-knex')(session);
const knex = require("../data/db-config");
const authRouter = require('./auth/auth-router'); // Import the authRouter
const usersRouter = require('./users/users-router'); // Import the usersRouter
const server = express();

const sessionConfig = {
  name: 'chocolatechip',
  secret: 'keep it secret, keep it safe', // Used to sign the cookie
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
    secure: false, // set to true in production, only send cookie over HTTPS
    httpOnly: true, // JS cannot access the cookie on the client
  },
  resave: false, // Avoid recreating unchanged sessions
  saveUninitialized: false, // GDPR laws against setting cookies automatically
  store: new KnexSessionStore({
    knex: dbConfig, // configured instance of knex
    tablename: 'sessions', // table to create to store sessions
    sidfieldname: 'sid', // column that will hold the session id
    createtable: true, // if the table does not exist, it will create it automatically
    clearInterval: 1000 * 60 * 60, // remove expired sessions
  }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(session(sessionConfig));
server.use('/api/users', usersRouter);
server.use('/api/auth', authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;

