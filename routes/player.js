import express from "express";
import db from "../configs/db.js";
import crypto from "crypto";
import controller from "../middlewares/controller.js";
const router = express.Router();

router.get("/list", async (req, res, next) => {
  try {
    const data = await db.query(
      "SELECT * FROM players ORDER BY entry_date ASC"
    );
    res.json(data.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/list/:gameID", async (req, res, next) => {
  try {
    const data = await db.query(
      "SELECT * FROM players WHERE game_id = $1 ORDER BY entry_date ASC",
      [req.params.gameID]
    );
    res.json(data.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/list/:gameID",  controller.limitRegistrations, async (req, res, next) => {


  try {
      const { name, is_coach } = req.body;
  const gameID = req.params.gameID;
    await db.query("BEGIN");

    const gameRes = await db.query(
      "SELECT player_spot_availability FROM games WHERE id = $1 FOR UPDATE",
      [req.params.gameID]
    );

    if (!gameRes.rows[0]) {
      await db.query("ROLLBACK");
      return res.status(404).send("Game not found");
    }

    const capacity = gameRes.rows[0].player_spot_availability;

    const countRes = await db.query(
      "SELECT COUNT(*) FROM players WHERE game_id = $1 AND is_player = true",
      [gameID]
    );

    const activePlayers = parseInt(countRes.rows[0].count);
    const cancelToken = crypto.randomBytes(16).toString("hex");
    const entryDate = is_coach
      ? "0001-01-01 00:00:00"
      : new Date();

    if (is_coach) {
      if (activePlayers >= capacity) {
        const lastPlayer = await db.query(
          `SELECT id FROM players
           WHERE game_id = $1 AND is_player = true AND is_coach = false
           ORDER BY entry_date DESC
           LIMIT 1
           FOR UPDATE`,
          [gameID]
        );

        if (lastPlayer.rows[0]) {
          await db.query(
            "UPDATE players SET is_player = false, is_waiting = true WHERE id = $1",
            [lastPlayer.rows[0].id]
          );
        }
      }

      await db.query(
        `INSERT INTO players
         (game_id, name, is_coach, is_player, is_waiting, entry_date, cancel_token)
         VALUES ($1, $2, true, false, false, $3, $4)`,
        [gameID, name, entryDate, cancelToken]
      );

    } else {
      const isPlayer = activePlayers < capacity;

      await db.query(
        `INSERT INTO players
         (game_id, name, is_coach, is_player, is_waiting, entry_date, cancel_token)
         VALUES ($1, $2, false, $3, $4, $5, $6)`,
        [gameID, name, isPlayer, !isPlayer, entryDate, cancelToken]
      );
    }

    await db.query("COMMIT");
      req.session.registrations[gameID] =
        (req.session.registrations[gameID] || 0) + 1;
res.status(201).json({
  token: {
    rows: [{ cancel_token: cancelToken }]
  },
  message: "Player created successfully !"
});

  } catch (err) {
    await db.query("ROLLBACK");
    next(err);
  }
});
router.delete("/list/delete/:id",async (req,res)=>{
try {
    await db.query("BEGIN");

    const playerRes = await db.query(
      "SELECT id, game_id, is_player FROM players WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );  
    if (!playerRes.rows[0]) {
      await db.query("ROLLBACK");
      return res.status(404).send("Invalid cancel token");
    }

    const { id, game_id, is_player } = playerRes.rows[0];

    await db.query("DELETE FROM players WHERE id = $1", [id]);

    if (is_player) {
      const waitingRes = await db.query(
        `SELECT id FROM players
         WHERE game_id = $1 AND is_waiting = true
         ORDER BY entry_date ASC
         LIMIT 1
         FOR UPDATE`,
        [game_id]
      );

      if (waitingRes.rows[0]) {
        await db.query(
          "UPDATE players SET is_player = true, is_waiting = false WHERE id = $1",
          [waitingRes.rows[0].id]
        );
      }
    }

    await db.query("COMMIT");
    if (req.session?.registrations?.[game_id]) {
  req.session.registrations[game_id]--;
  if (req.session.registrations[game_id] < 0) {
    req.session.registrations[game_id] = 0;
  }
}

    res.send("Cancelled successfully");

  } catch (err) {
    await db.query("ROLLBACK");
    next(err);
  }
});

router.delete("/list/cancel/:token", async (req, res, next) => {
  try {
    await db.query("BEGIN");

    const playerRes = await db.query(
      "SELECT id, game_id, is_player FROM players WHERE cancel_token = $1 FOR UPDATE",
      [req.params.token]
    );

    if (!playerRes.rows[0]) {
      await db.query("ROLLBACK");
      return res.status(404).send("Invalid cancel token");
    }

    const { id, game_id, is_player } = playerRes.rows[0];

    await db.query("DELETE FROM players WHERE id = $1", [id]);

    if (is_player) {
      const waitingRes = await db.query(
        `SELECT id FROM players
         WHERE game_id = $1 AND is_waiting = true
         ORDER BY entry_date ASC
         LIMIT 1
         FOR UPDATE`,
        [game_id]
      );

      if (waitingRes.rows[0]) {
        await db.query(
          "UPDATE players SET is_player = true, is_waiting = false WHERE id = $1",
          [waitingRes.rows[0].id]
        );
      }
    }

    await db.query("COMMIT");
    if (req.session?.registrations?.[game_id]) {
  req.session.registrations[game_id]--;
  if (req.session.registrations[game_id] < 0) {
    req.session.registrations[game_id] = 0;
  }
}

    res.send("Cancelled successfully");

  } catch (err) {
    await db.query("ROLLBACK");
    next(err);
  }
});

export default router;