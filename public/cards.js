export const cardDatabase = [
    // --- REDAN EXISTERANDE KORT ---
    { name: "Hoochief", str: 5, dmg: 2, con: 10, cost: 3 },
    { name: "Aero Predator", str: 4, dmg: 3, con: 8, cost: 1 },
    { name: "Glacio Prism", str: 2, dmg: 1, con: 15, cost: 1, activeEffect: "prism", skillText: "Active: Reconstruct this Echo to gain 1 Energy and draw 1 card." },
    { name: "Havoc Warrior", str: 6, dmg: 4, con: 6, cost: 3 },
    { name: "Diggy Duggy", str: 1, dmg: 1, con: 4, cost: 1, transformEffect: "draw3", skillText: "Transform: Draw 3 cards." },
    { name: "Sabyr Boar", str: 2, dmg: 1, con: 2, cost: 1, transformEffect: "energy3", skillText: "Transform: Gain 3 Energy." },
    { name: "Snip Snap", str: 3, dmg: 1, con: 3, cost: 1, specialSkill: "last-stand", skillText: "Last Stand: Deal 50% dmg when HP below 10" },
    { name: "Violet Heron", str: 4, dmg: 1, con: 4, cost: 3 },
    { name: "Rocksteady Bell", str: 1, dmg: 0, con: 12, cost: 1 },
    { name: "Tambourinist", str: 2, dmg: 2, con: 3, cost: 1 },
    { name: "Vanguard Junrock", str: 1, dmg: 1, con: 3, cost: 1, modulateEffect: "draw2", skillText: "Modulate: Draw 2 cards." },
    { name: "Fusion Prism", str: 2, dmg: 1, con: 10, cost: 1, activeEffect: "prism", skillText: "Active: Reconstruct this Echo to gain 1 Energy and draw 1 card." },

    // inferno rider lek
    { name: "Chop Chop Headless", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "SpearBack", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Fusion Warrior", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Dwarf Cassowary", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Fission Junrock", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "La Guardia", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Baby Viridblaze", str: 1, dmg: 1, con: 1, cost: 1 },

    // feilian beringal lek
    { name: "Carapace", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Hoartoise", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Diamond Claw", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Abyssal Patricius", str: 1, dmg: 1, con: 1, cost: 1 },
    { name: "Cyan Feather", str: 1, dmg: 1, con: 1, cost: 1 }
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
