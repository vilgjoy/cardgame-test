import express from "express"
import pool from "../config/database.js"
const router = express.Router()

router.get("/deck/:name", async (req, res, next) => {
    try {
        const deckName = req.params.name;
        const [rows] = await pool.query(`
            SELECT cards.*, cards.skill_text AS skillText FROM cards
            JOIN deck_lists ON cards.id = deck_lists.card_id
            WHERE deck_lists.deck_name = ?
        `, [deckName]);
        
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

export default router;