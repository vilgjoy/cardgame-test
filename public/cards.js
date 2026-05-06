export const cardDatabase = [
    { name: "Hoochief", str: 5, dmg: 2, con: 10, cost: 3 },
    { name: "Aero Predator", str: 3, dmg: 1, con: 4, cost: 1, modulateEffect: "draw2", skillText: "Modulate: Draw 2 cards." },
    { name: "Glacio Prism", str: 2, dmg: 1, con: 15, cost: 1, activeEffect: "prism", skillText: "Active: Reconstruct this Echo to gain 1 Energy and draw 1 card." },
    { name: "Havoc Warrior", str: 6, dmg: 4, con: 6, cost: 3 },
    { name: "Diggy Duggy", str: 1, dmg: 1, con: 4, cost: 1, transformEffect: "draw3", skillText: "Transform: Draw 3 cards." },
    { name: "Sabyr Boar", str: 2, dmg: 1, con: 2, cost: 1, transformEffect: "energy3", skillText: "Transform: Gain 3 Energy." },
    { name: "Snip Snap", str: 4, dmg: 1, con: 3, cost: 1, specialSkill: "last-stand", skillText: "Last Stand: Deal 50% dmg when HP below 10" },
    { name: "Violet Heron", str: 4, dmg: 1, con: 4, cost: 3 },
    { name: "Rocksteady Bell", str: 1, dmg: 0, con: 12, cost: 1 },
    { name: "Tambourinist", str: 2, dmg: 2, con: 3, cost: 1 },
    { name: "Vanguard Junrock", str: 1, dmg: 1, con: 3, cost: 1, modulateEffect: "draw2", skillText: "Modulate: Draw 2 cards." },
    { name: "Fusion Prism", str: 2, dmg: 1, con: 10, cost: 1, activeEffect: "prism", skillText: "Active: Reconstruct this Echo to gain 1 Energy and draw 1 card." },

    // inferno rider lek new
    { name: "Chop Chop Headless", str: 2, dmg: 3, con: 8, cost: 3, transformEffect: "chopChopBuff", transformCost: 3, skillText: "Transform (Cost 3): +2 STR and +1 CON to all your echoes this round."  },
    { name: "SpearBack", str: 4, dmg: 3, con: 6, cost: 3, skillText: "When you Modulate this Echo, if Flank Force is already Activated, increase its STR and CON by 2 for 2 rounds." },
    { name: "Fusion Warrior", str: 3, dmg: 1, con: 3, cost: 1, specialSkill: "flank-force", skillText: "Flank Force: If placed with two other echoes, everyone gets +1 DMG" },
    { name: "Dwarf Cassowary", str: 1, dmg: 1, con: 4, cost: 1, transformEffect: "strBuff1", skillText: "Transform: Increase all your Echoes STR by 1 this round." },
    { name: "Fission Junrock", str: 2, dmg: 1, con: 2, cost: 1, transformEffect: "discoverCost1", skillText: "Transform: Show 3st 1-cost echoes from the deck. Put one in your hand, the rest is shuffled back." },
    { name: "La Guardia", str: 3, dmg: 1, con: 3, cost: 1, specialSkill: "last-stand", skillText: "Last Stand: Deal 50% dmg when HP below 10" },
    { name: "Baby Viridblaze", str: 2, dmg: 1, con: 4, cost: 1, specialSkill: "flank-force", skillText: "Flank Force. When you Modulate this Echo, increase its STR by 2 and CON by 1 until the round ends." },

    // feilian beringal lek new
    { name: "Carapace", str: 0, dmg: 3, con: 10, cost: 3, skillText: "During battle, gains +3 DMG." },
    { name: "Hoartoise", str: 1, dmg: 1, con: 4, cost: 1, transformEffect: "hoartoiseBlock", skillText: "Transform: (1) Blocks 3 damage from the next attack against you."},
    { name: "Diamond Claw", str: 2, dmg: 1, con: 3, cost: 1, modulateEffect: "draw2", skillText: "Modulate: Draw 2 cards." },
    { name: "Abyssal Patricius", str: 4, dmg: 3, con: 6, cost: 3, skillText: "During battle, gains +2 STR and +2 CON for 4 rounds." },
    { name: "Cyan Feather", str: 3, dmg: 3, con: 6, cost: 3, transformEffect: "cyanFeatherHeal", transformCost: 3, skillText: "Transform (Cost 3): Heal 6 HP." },
];

export const coreEchoes = {
    infernoRider: { 
        name: "Inferno Rider", 
        str: 6, dmg: 8, con: 12, cost: 0, 
        isCore: true,
        skillText: "Core Skill: When deployed echoes with Last Stand gain 3 STR/CON."
    },
    feilianBeringal: { 
        name: "Feilian Beringal", 
        str: 6, dmg: 8, con: 12, cost: 0, 
        isCore: true,
        skillText: "Core Skill: When deployed, heal 2 HP at start of Combat. All your cards gain +2 CON."
    }
};
