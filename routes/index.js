import express from "express";
import db from "../config/db.js"; 

const router = express.Router();

// 2. Ta bort "async"
router.get("/deck/:name", (req, res, next) => {
    try {
        const deckName = req.params.name;
        
        const rows = db.prepare(`
            SELECT cards.*, cards.skill_text AS skillText FROM cards
            JOIN deck_lists ON cards.id = deck_lists.card_id
            WHERE deck_lists.deck_name = ?
        `).all(deckName); 
        
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

export default router;