import Database from 'better-sqlite3';

const db = new Database('echo_game.db');
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cost INTEGER,
        str INTEGER,
        dmg INTEGER,
        con INTEGER,
        is_core BOOLEAN,
        transform_effect TEXT,
        transform_cost INTEGER,
        modulate_effect TEXT,
        special_effect TEXT,
        skill_text TEXT
    );

    CREATE TABLE IF NOT EXISTS deck_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_name TEXT NOT NULL,
        card_id INTEGER,
        FOREIGN KEY(card_id) REFERENCES cards(id)
    );
`);

export default db;