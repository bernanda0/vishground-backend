import { Router } from "express";
import db from "../db/db.js";

const router = Router();

router.get("/updatecentral", (req, res) => {
  getUpdatesCentral((rows) => {
    res.send(rows);
  });
});

router.post("/insertcentral", (req, res) => {
  insertDataCentral(
    req.body.temperature,
    req.body.humidity,
    req.body.pressure,
    req.body.ozone,
    req.body.timestamp
  );
  res.send("Data central inserted into the database");
});

function getUpdatesCentral(callback) {
  const query =
    "SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM sensor_central) subquery WHERE rn <= 20";

    db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      callback([]);
    } else {
      const rows = result.rows;
      callback(rows);
    }
  });
}

export default router;
