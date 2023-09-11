import { Router } from "express";
import db from "../db/db.js";
import logger from "../tools/logging.js";

const router = Router();

router.post("/truncate", (req, res) => {
  truncatedTableNode();
  res.send("Truncate Table Sum Node");
});

router.post("/insert", (req, res) => {
  insertSumNode(req.body.id, req.body.angka);
  res.send("Data sum node inserted into the database");
});

router.get("/getAll", (req, res) => {
  getUpdatesSumNode((rows, stat) => {
    res.status(stat).send(rows);
  });
});


function truncatedTableNode() {
  const query = `TRUNCATE TABLE sum_node`;
  db.query(query, (err, res) => {
    if (err) {
      logger.error(err.stack);
    } else {
      logger.info("SUCCESFULLY TRUNCATED TABLE");
    }
  });
}

function insertSumNode(id, angka) {
  const query = `INSERT INTO sum_node (id, angka)
                     VALUES ($1, $2)
                     ON CONFLICT (id) DO UPDATE
                     SET angka = EXCLUDED.angka;`;

  const values = [id, angka];

  db.query(query, values, (err, res) => {
    if (err) {
      logger.error(err.stack);
    } else {
      logger.info("SUCCESSFULLY INSERTED OR UPDATED SUM NODE");
    }
  });
}

function getUpdatesSumNode(callback) {
  const query = `SELECT * FROM sum_node`;

  db.query(query, (err, res) => {
    if (err) {
      logger.error(err);
      callback("Error", 500);
    } else {
      const rows = res.rows;
      logger.log(rows);
      callback(rows, 200);
    }
  });
}

// 

// app.get("/updatenode/:nodeId", (req, res) => {
//   const { nodeId } = req.params;
//   getUpdatesNode(nodeId, (rows) => {
//     res.send(rows);
//   });
// });


// app.post("/insertnode", (req, res) => {
//   insertDataNode(req.body.node, req.body.temperature, req.body.humidity, req.body.moisture, req.body.timestamp);
//   res.send("Data node inserted into the database");
// });

export default router;