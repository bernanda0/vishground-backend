import { Router } from "express";
const router = Router();
import passport from "../auth/passport.js";
import db from "../db/db.js";
import logger from "../tools/logging.js";

const { SERVER_BASE_URL } = process.env;
const baseUrl = `${SERVER_BASE_URL}auth`;

router.get("/", (req, res) => {
  if (req.user) {
    res.send(`Welcome ${req.user.username}`);
  } else {
    res.send("Need to login first");
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
  }),
  (req, res) => {
    if (req.user) {
      res.redirect(baseUrl + '/login/success');
    } else {
      res.redirect(baseUrl + '/login/fail');
    }
  }
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: `Welcome ${req.user.display_name}!`,
      id: req.user.google_id,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "User has not been authenticated",
    });
  }
});

router.get("/login/failed", (req, res) => {
  const message = req.query.message || "Login failed";
  res.status(400).json({
    success: false,
    message: message,
  });
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      req.session.destroy();
      logger.info("User logged out");
      res.status(200).json({
        success: true,
        message: "User logged out",
      });
    }
  });
});

export default router;
