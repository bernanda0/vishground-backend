import { Router } from "express";
import db from "../db/db.js";

const router = Router();

router.post("/truncate", (req, res) => {
  truncatedTableNode();
  res.send("Truncate Table Sum");
});

router.get("/get/:node", (req, res) => {
  const { node } = req.params;
  getUpdatesCoordinate(node, (rows) => {
    res.send(rows);
  });
});

router.post("/insert", (req, res) => {
    insertDataCoordinate(
      req.body.node,
      req.body.latitude,
      req.body.longitude,
      req.body.coordinate
    );
    res.send("Data coordinate inserted into the database");
  });


function truncatedTableNode() {
  const query = `TRUNCATE TABLE coordinate`;

  db.query(query, (err, res) => {
    if (err) {
      console.error(err.stack);
    } else {
      console.log("SUCCESFULLY TRUNCATED TABLE");
    }
  });
}

function insertDataCoordinate(node, latitude, longitude, coordinate) {
  const query = `
      INSERT INTO coordinate (node, latitude, longitude, coordinate)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (node) DO UPDATE
      SET latitude = excluded.latitude,
          longitude = excluded.longitude,
          coordinate = excluded.coordinate
    `;

  const values = [node, latitude, longitude, coordinate];

  db.query(query, values, (err, res) => {
    if (err) {
      console.error(err.stack);
    } else {
      console.log("Successfully inserted data into coordinate table");
    }
  });
}

// function getUpdatesCoordinate(node, callback) {
//   const query = `SELECT * FROM coordinate WHERE node = $1`;
//   const values = [node];

//   client.query(query, values, (err, res) => {
//     if (err) {
//       console.error(err);
//       callback([]);
//     } else {
//       const rows = res.rows;
//       callback(rows);
//     }
//   });
// }

function getUpdatesCoordinate(node, callback) {
  console.info("cekkk");
  const query = `SELECT * FROM coordinate WHERE node = $1`;
  const values = [node];

  db.query(query, values, (err, res) => {
    if (err) {
      console.error(err);
      callback([]);
    } else {
      const rows = res.rows;
      if (rows == null) {
        console.info("mt");
      }
      console.info(rows);
      callback(rows);
    }
  });
}

export default router;