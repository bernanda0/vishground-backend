import dotenv from "dotenv";
import pkg from "pg";
import logger from "../tools/logging.js";

const { Client } = pkg;
dotenv.config({
  path: "local.env"
});

var client = new Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  host: process.env.PG_HOST,
  ssl: process.env.PG_SSL,
});

client.connect((err) => {
  try {
    logger.info("Connected to DB " + process.env.PG_DATABASE);
  } catch (error) {
    logger.error(err);
    return;
  }
});

export default client;
