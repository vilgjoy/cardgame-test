import Database from 'better-sqlite3';

const db = new Database('echo_game.db');
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cost INTEGER NOT NULL,
        str INTEGER NOT NULL,
        dmg INTEGER NOT NULL,
        con INTEGER NOT NULL,
        transform_effect TEXT DEFAULT NULL,
        transform_cost INTEGER DEFAULT NULL,
        skill_text TEXT,
        is_core INTEGER DEFAULT 0,
        special_effect TEXT DEFAULT NULL,
        modulate_effect TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS deck_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_name TEXT NOT NULL,
        card_id INTEGER NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards (id)
    );
`);

const count = db.prepare('SELECT COUNT(*) as count FROM cards').get();

if (count.count === 0) {
    console.log("Databasen är tom! Skickar in alla kort...");

    db.exec(`
        INSERT INTO cards (id, name, cost, str, dmg, con, transform_effect, transform_cost, skill_text, is_core, special_effect, modulate_effect) VALUES
        (1, 'Chop Chop Headless', 3, 2, 3, 8, 'chopChopBuff', 3, 'Transform (Cost 3): +2 STR and +1 CON to all your echoes this round.', 0, NULL, NULL),
        (2, 'SpearBack', 3, 4, 3, 6, NULL, NULL, 'When you Modulate this Echo, if Flank Force is already Activated, increase its STR and CON by 2 for 2 rounds.', 0, NULL, NULL),
        (3, 'Snip Snap', 1, 4, 1, 3, NULL, NULL, 'Last Stand: Deal 50% dmg when HP below 10', 0, 'last-stand', NULL),
        (4, 'Diggy Duggy', 1, 1, 1, 4, 'draw3', 1, 'Transform: Draw 3 cards.', 0, NULL, NULL),
        (5, 'Sabyr Boar', 1, 2, 1, 2, 'energy3', 1, 'Transform: Gain 3 Energy.', 0, NULL, NULL),
        (6, 'Fusion Warrior', 1, 3, 1, 3, NULL, NULL, 'Flank Force: If placed with two other echoes, everyone gets +1 DMG', 0, 'flank-force', NULL),
        (7, 'Dwarf Cassowary', 1, 1, 1, 4, 'strBuff1', 1, 'Transform: Increase all your Echoes STR by 1 this round.', 0, NULL, NULL),
        (8, 'Fission Junrock', 1, 2, 1, 2, 'discoverCost1', 1, 'Transform: Show 3st 1-cost echoes from the deck. Put one in your hand, the rest is shuffled back.', 0, NULL, NULL),
        (9, 'La Guardia', 1, 3, 1, 3, NULL, NULL, 'Last Stand: Deal 50% dmg when HP below 10', 0, 'last-stand', NULL),
        (10, 'Baby Viridblaze', 1, 2, 1, 4, NULL, NULL, 'Flank Force. When you Modulate this Echo, increase its STR by 2 and CON by 1 until the round ends.', 0, 'flank-force', NULL),
        (11, 'Carapace', 3, 0, 3, 10, NULL, NULL, 'During battle, gains +3 DMG.', 0, NULL, NULL),
        (12, 'Hoartoise', 1, 1, 1, 4, 'hoartoiseBlock', 1, 'Transform: (1) Blocks 3 damage from the next attack against you.', 0, NULL, NULL),
        (13, 'Aero Predator', 1, 3, 1, 4, NULL, NULL, 'Modulate: Draw 2 cards.', 0, NULL, 'draw2'),
        (14, 'Diamond Claw', 1, 2, 1, 3, NULL, NULL, 'Modulate: Draw 2 cards.', 0, NULL, 'draw2'),
        (15, 'Vanguard Junrock', 1, 1, 1, 3, NULL, NULL, 'Modulate: Draw 2 cards.', 0, NULL, 'draw2'),
        (16, 'Abyssal Patricius', 3, 4, 3, 6, NULL, NULL, 'During battle, gains +2 STR and +2 CON for 4 rounds.', 0, NULL, NULL),
        (17, 'Cyan Feather', 3, 3, 3, 6, 'cyanFeatherHeal', 3, 'Transform (Cost 3): Heal 6 HP.', 0, NULL, NULL),
        (18, 'Inferno Rider', 0, 6, 8, 12, NULL, NULL, 'Core Skill: When deployed echoes with Last Stand gain 3 STR/CON.', 1, NULL, NULL),
        (19, 'Feilian Beringal', 0, 6, 8, 12, NULL, NULL, 'Core Skill: When deployed, heal 2 HP at start of Combat. All your cards gain +2 CON.', 1, NULL, NULL);

        INSERT INTO deck_lists (id, deck_name, card_id) VALUES
        (1, 'Inferno', 1),
        (2, 'Inferno', 2),
        (3, 'Inferno', 3),
        (4, 'Inferno', 4),
        (5, 'Inferno', 5),
        (6, 'Inferno', 6),
        (7, 'Inferno', 7),
        (8, 'Inferno', 8),
        (9, 'Inferno', 9),
        (10, 'Inferno', 10),
        (11, 'Inferno', 18),
        (12, 'Feilian', 11),
        (13, 'Feilian', 4),
        (14, 'Feilian', 5),
        (15, 'Feilian', 8),
        (16, 'Feilian', 12),
        (17, 'Feilian', 13),
        (18, 'Feilian', 14),
        (19, 'Feilian', 15),
        (20, 'Feilian', 16),
        (21, 'Feilian', 17),
        (22, 'Feilian', 19);
    `);
    
    console.log("All data inlagd med lyckat resultat!");
}

export default db;