import express from "express";
import db from "../configs/db.js";
import controller from "../middlewares/controller.js";

const router = express.Router();

router.get("/list", async(req, res, next) => {
    try {
        const data = await db.query("SELECT * FROM games");
        res.status(200).json(data.rows);
    } catch (err) {
        next(err);
    }
});

router.get("/list/:gameID", async(req, res, next) => {
    try {
        const data = await db.query("SELECT * FROM games WHERE id = $1", [req.params.gameID]);
        res.status(200).json(data.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.post("/list", controller.validateCreateGame, async(req, res, next) => {
    try {
        const {
            name_eng,
            name_arb,
            status,
            day_date,
            start_hour,
            end_hour,
            location_link,
            player_spot_availability,
            wek_recurring
        } = req.body;
        await db.query(`
  INSERT INTO games (
    name_eng,
    name_arb,
    status,
    day_date,
    start_hour,
    end_hour,
    location_link,
    player_spot_availability,
    week_recurring
  ) VALUES (
   $1, $2, $3, $4, $5, $6, $7, $8, $9
)
`, [name_eng,
            name_arb,
            status,
            day_date,
            start_hour,
            end_hour,
            location_link,
            player_spot_availability,
            
            week_recurring,
        ]);
        res.status(201).send("Game created successfully !")
    } catch (err) {
        next(err);
    }
});

router.patch("/list/:gameID", controller.validateUpdateGame, async(req, res, next) => {
    try {

        const values = [...req.sqlValues, req.params.gameID]

        const updatedData = await db.query(`UPDATE games SET ${req.sqlUpdatesCode} WHERE id = $${values.length} RETURNING *`, values);

        res.status(200).json(updatedData.rows[0]);
    } catch (err) {
        next(err);
    }
});
router.delete("/list/:gameID", async(req, res, next) => {
    try {
        await db.query("DELETE FROM players WHERE game_id = $1", [req.params.gameID]);
        await db.query("DELETE FROM games WHERE id = $1", [req.params.gameID]);
        res.status(200).send("Game deleted successfully !");

    } catch (err) {
        next(err);
    }
});

export default router;