import { config } from "dotenv";
import express from "express";
import session from "express-session";
import connect_pg from "connect-pg-simple";
import passport from "passport";
import db from "./db/db.js"
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import body_parser from "body-parser";
import auth from "./routes/auth.js"
import hello from "./routes/hello.js";
import coor from "./routes/coordinate.js"
import node from "./routes/node.js"
import sessionError from "./auth/sessionChecker.js"
import central from "./routes/central.js"
import logger, { customLogFormat } from './tools/logging.js';

// dotenv
config({
  path: "./local.env",
});

// pg for session
const PostgresqlStore = connect_pg(session);
const sessionStore = new PostgresqlStore({
  pool: db,
  tableName: "user_session",
});

// instantiation
const app = express();
const { urlencoded, json } = body_parser;

// installing middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,PATCH,OPTIONS");
  next();
});
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: "auto",
      sameSite: "lax",
    },
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(morgan(customLogFormat));
app.use(helmet());
app.use(xss());
app.use(cors());

// use the router
app.get("/", (req, res) => {
  res.send("WELCOME TO VISHGROUND API🚀");
});
app.use("/auth", auth)
app.use("/hello", hello)
app.use("/coor", coor)
app.use("/node", node)
app.use("/central", central)
app.use(sessionError);

// start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  logger.info(`App is listening on port ${port}`);
});


