import { Router } from "express";
import _query from "../db/db.js";
import { sessionChecker } from "../auth/sessionChecker.js";

const router = Router();

router.get("/", sessionChecker, (req, res) => {
    res.send({
        msg: "Hello"
    })
})

export default router;


