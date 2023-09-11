import { Strategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import passport from "passport";
import db from "../db/db.js";
import logger from "../tools/logging.js";
import paseto from "./paseto.js";

const { Strategy: GoogleStrategy } = Strategy;

dotenv.config({
  path: "local.env",
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.SERVER_BASE_URL + "auth/google/callback",
      scope: ["profile", "email"],
    },
    async (_, __, ____, profile, done) => {
      const account = profile._json;
      const id = profile.id;
      let user = {};
      try {
        user = await db.query("SELECT * FROM users WHERE google_id = $1", [id]);
        if (user.rows.length > 0) {
          logger.info("User already registered, continuing to login");
        } else {
          user = await db.query(
            "INSERT INTO users (google_id, display_name, email, profile_picture_url) VALUES ($1, $2, $3, $4) RETURNING *",
            [id, account.name, account.email, account.picture]
          );
          logger.info("User successfully registered in database");
        }

        // time
        const currentUnixTimestamp = Math.floor(Date.now() / 1000);
        const accessTokenExp = currentUnixTimestamp + 900; // 900 seconds (15 minutes) from now
        const refreshTokenExp =  currentUnixTimestamp + 86400;

        const atokExpISO8601 = new Date(accessTokenExp * 1000).toString();
        const rtokExpISO8601 = new Date(refreshTokenExp * 1000).toString();

        const accessTokenPayload = {
          google_id: id,
          // exp: atokExpISO8601,
        };
        const token = await paseto.createToken(accessTokenPayload);
        logger.info(token);
        done(null, token);
      } catch (err) {
        logger.error(err);
        done(err);
      }
    }
  )
);

passport.serializeUser((token, done) => {
  done(null, token);
});

passport.deserializeUser(async (token, done) => {
  try {
    const payload = await paseto.verifyToken(token);
    const { google_id } = payload;

    db.query(
      "SELECT google_id, display_name FROM users WHERE google_id = $1",
      [google_id],
      (err, results) => {
        if (err) {
          return done(err);
        }
        return done(null, results.rows[0]);
      }
    );
  } catch (err) {
    logger.error(err);
  }
});

export default passport;
