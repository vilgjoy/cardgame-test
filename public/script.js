import { cardDatabase, coreEchoes } from './cards.js';
import { startCombat } from './combat.js';

const hand = document.getElementById('hand');
const frontline = document.getElementById('frontline'); 
const backline = document.getElementById('backline');   
const drawBtn = document.getElementById('draw-btn');
const readyBtn = document.getElementById('ready-btn');
const energyText = document.getElementById('energy-text');
const energyCircle = document.getElementById('energy-circle'); 
const deckCountText = document.getElementById('deck-count'); 
const transformZone = document.getElementById('transform-zone')
const combatArena = document.getElementById('combat-arena');
const gameArea = document.getElementById('game-area');
const playerHpText = document.getElementById('player-hp-text');
const enemyHpText = document.getElementById('enemy-hp-text');
const playerHpCircle = document.getElementById('player-hp-circle');
const enemyHpCircle = document.getElementById('enemy-hp-circle');
const enemyBoard = document.getElementById('enemy-board');

const maxEnergy = 4;
let currentEnergy = 4;
let currentRound = 1;
let playerHP = 16;
let enemyHP = 20;
let battlesLost = 0;

let myCoreEcho;
let aiCoreEcho;
let coreEchoUnlocked = false;
let aiCoreEchoReady = false; 
let aiCoreEchoUsed = false;
let aiBattlesLost = 0;

let aiEnergy = 4;
let aiBoardData = [];
// deck
let playerDeck = [];
let aiDeck = [];
let cardCounts = {}; // håller koll på hur många av varje kort

const infernoDeckList = [
    "Chop Chop Headless", "SpearBack", "Snip Snap", "Diggy Duggy", "Sabyr Boar", 
    "Fusion Warrior", "Dwarf Cassowary", "Fission Junrock", "La Guardia", "Baby Viridblaze"
];

const feilianDeckList = [
    "Carapace", "Diggy Duggy", "Sabyr Boar", "Hoartoise", "Aero Predator", 
    "Diamond Claw", "Vanguard Junrock", "Abyssal Patricius", "Cyan Feather", "Fission Junrock"
];

const playerChoseCore = confirm("VÄLJ CORE ECHO\nKlicka OK för att få INFERNO RIDER.\nKlicka AVBRYT för att få FEILIAN BERINGAL.");

if (playerChoseCore) {
    myCoreEcho = coreEchoes.infernoRider;
    playerDeck = createSpecificDeck(infernoDeckList);
    
    aiCoreEcho = coreEchoes.feilianBeringal;
    aiDeck = createSpecificDeck(feilianDeckList);
} else {
    myCoreEcho = coreEchoes.feilianBeringal;
    playerDeck = createSpecificDeck(feilianDeckList);
    
    aiCoreEcho = coreEchoes.infernoRider;
    aiDeck = createSpecificDeck(infernoDeckList);
}

shuffleDeck(playerDeck);
shuffleDeck(aiDeck);



while (playerDeck.length < 20) {
    const randomCard = cardDatabase[Math.floor(Math.random() * cardDatabase.length)];
    
    if (!cardCounts[randomCard.name]) {
        cardCounts[randomCard.name] = 0;
    }

    if (cardCounts[randomCard.name] < 2) {
        playerDeck.push(randomCard);
        cardCounts[randomCard.name]++; 
    }
}

function createSpecificDeck(cardNames) {
    let deck = [];
    cardNames.forEach(name => {
        const baseCard = cardDatabase.find(c => c.name === name);
        if (baseCard) {
            deck.push({ ...baseCard });
            deck.push({ ...baseCard }); // Kopiera kortet igen (x2)
        } else {
            console.error(`Kortet "${name}" saknas i cardDatabase!`);
        }
    });
    return deck;
}

function updateHPUI() {
    if (playerHpText) playerHpText.innerText = playerHP;
    if (enemyHpText) enemyHpText.innerText = enemyHP;
}
updateHPUI();

function updateDeckUI() {
    deckCountText.innerText = playerDeck.length;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function updateEnergyUI() {
    energyText.innerText = `${currentEnergy} / ${maxEnergy}`;
}

function createCard(cardData, existingModulations = 0) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('draggable', 'true');
    //spar data för miniräknare
    card.dataset.cost = cardData.cost;
    card.dataset.transformEffect = cardData.transformEffect || "";
    card.dataset.baseCost = cardData.cost; 
    card.dataset.str = cardData.str;
    card.dataset.dmg = cardData.dmg;
    card.dataset.con = cardData.con;
    card.dataset.isCore = cardData.isCore ? "true" : "false";
    card.dataset.modulations = existingModulations; // startar på 0
    card.dataset.modulateEffect = cardData.modulateEffect || "";
    card.dataset.activeEffect = cardData.activeEffect || "";
    card.dataset.specialSkill = cardData.specialSkill || ""; 
    card.dataset.activeSpecialSkill = cardData.activeSpecialSkill || "";

    if (cardData.name === "Inferno Rider") {
        cardData.activeSpecialSkill = "last-stand";
        card.dataset.activeSpecialSkill = "last-stand";
    }
    
    card.dataset.fullData = JSON.stringify(cardData); 

    if (cardData.isCore) {
        card.classList.add('core-card');
    }

    if (existingModulations > 0) {
        card.classList.add('modulated-card');
    }
    
    card.innerHTML = `
        <div class="card-cost">💎 ${cardData.cost}</div>
        <div class="card-name">${cardData.name}</div>
        ${cardData.skillText ? `<div class="card-skill" style="font-size: 10px; color: #f1c40f; text-align: center; margin-top: 5px; font-style: italic;">✨ ${cardData.skillText}</div>` : ''}
        ${cardData.activeSpecialSkill ? `<div class="active-skill" style="font-size: 10px; color: #e74c3c; font-weight: bold; text-align: center;">🔥 ${cardData.activeSpecialSkill.toUpperCase()} AKTIVERAD!</div>` : ''}
        <div class="card-stats">
            <span title="Strength">⚔️ ${cardData.str}</span>
            <span title="Damage">💥 ${cardData.dmg}</span>
            <span title="Constitution (HP)">❤️ ${cardData.con}</span>
        </div>
    `;
    
    card.addEventListener('dragstart', () => card.classList.add('dragging'));
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('click', () => {
        const isOnPlayerBoard = card.parentElement === frontline || card.parentElement === backline;

        if (isOnPlayerBoard) {
            const activeEffect = card.dataset.activeEffect;

            if (activeEffect === "prism") {
                card.remove();

                currentEnergy++;
                updateEnergyUI();
                drawCardFromDeck();
            }
            // kan lägga till andra active effects här)
        }
    });

    return card;
}

function takeAITurn() {
    aiEnergy = maxEnergy;
    aiBoardData = [];

    // rensa ai bräde från förra rundan
    if (enemyBoard) {
        enemyBoard.innerHTML = '';
    }

    let aiHand = [];
    if (aiCoreEchoReady) {
        aiHand.push(aiCoreEcho);
        aiCoreEchoReady = false; 
        aiCoreEchoUsed = true;
    }

    for (let i = 0; i < 4; i++) {
        if (aiDeck.length > 0) {
            aiHand.push(aiDeck.pop());
        }
    }

    for (let i = 0; i < aiHand.length; i++) {
        const card = aiHand[i];
        if (aiBoardData.length < 3 && aiEnergy >= card.cost) {
            aiBoardData.push(card);
            aiEnergy -= card.cost;
            
            const enemyCardEl = createCard(card);
            // inte kunna dra ai kort
            enemyCardEl.removeAttribute('draggable'); 

            if (card.isCore) {
                enemyCardEl.style.border = "3px solid #8e44ad"; 
                enemyCardEl.style.boxShadow = "0 0 15px #8e44ad";
            } else {
                enemyCardEl.style.border = "2px solid #e74c3c"; 
            }
            
            

            if (enemyBoard) {
                enemyBoard.appendChild(enemyCardEl);
            }
        }
    }
    console.log("AI la ut följande kort:", aiBoardData); //så det fungerar
}

takeAITurn();

readyBtn.addEventListener('click', () => {
    const playerCardElements = [...frontline.children, ...backline.children];
    let playerCardsData = playerCardElements.map(cardEl => JSON.parse(cardEl.dataset.fullData));

    const isInfernoRiderDeployed = playerCardElements.some(el => el.dataset.isCore === "true" && JSON.parse(el.dataset.fullData).name === "Inferno Rider");
    const isFeilianBeringalDeployed = playerCardElements.some(el => el.dataset.isCore === "true" && JSON.parse(el.dataset.fullData).name === "Feilian Beringal");

    const hasInfernoRider = playerCardsData.some(card => card.name === "Inferno Rider");
    const isHpLowEnough = playerHP <= 10;

    if (isFeilianBeringalDeployed) {
        const healAmount = 2; 
        playerHP = Math.min(20, playerHP + healAmount); 
        updateHPUI();
        console.log(`[CORE SKILL] Feilian Beringal läkte spelaren med ${healAmount} HP! Nuvarande HP: ${playerHP}`);
    }
    // last stand
    playerCardsData = playerCardsData.map(card => {
        let updatedCard = { ...card }; 

        if (updatedCard.activeSpecialSkill === "last-stand") {
            if (hasInfernoRider) {
                updatedCard.str += 3;
                updatedCard.con += 3;
                console.log(`[BUFF] ${updatedCard.name} fick +3 STR/CON av Inferno Rider!`);
            }
            if (isHpLowEnough) {
                updatedCard.dmg = Math.ceil(updatedCard.dmg * 1.5);
                console.log(`[LAST STAND] ${updatedCard.name} gör 50% extra skada! Ny DMG: ${updatedCard.dmg}`);
            }
        }

        if (isFeilianBeringalDeployed) {
            updatedCard.con += 2;
            console.log(`[CORE SKILL] ${updatedCard.name} fick +2 CON från Feilian Beringal!`);
        }

        return updatedCard;
    });

    const enemyCardsData = aiBoardData;

    gameArea.style.display = 'none';
    combatArena.style.display = 'block';

    startCombat(combatArena, playerCardsData, enemyCardsData, (combatResult) => {
        
        combatArena.style.display = 'none';
        gameArea.style.display = 'block';

        if (combatResult.playerWon) {
            enemyHP -= combatResult.playerDamageDealt;
            aiBattlesLost++;
            alert(`Du vann. Du gjorde ${combatResult.playerDamageDealt} i skada på motståndaren.`);
            
            if (enemyHpCircle) {
                enemyHpCircle.classList.add('shake');
                setTimeout(() => enemyHpCircle.classList.remove('shake'), 500);
            }
        } else if (!combatResult.draw) {
            playerHP -= combatResult.enemyDamageDealt;
            battlesLost++;
            alert(`Motståndare vann. Du tog ${combatResult.enemyDamageDealt} i skada.`);
            
            if (playerHpCircle) {
                playerHpCircle.classList.add('shake');
                setTimeout(() => playerHpCircle.classList.remove('shake'), 500);
            }
        } else {
            alert("oavgjort");
        }

        updateHPUI();

        if (playerHP <= 0) {
            alert("GAME OVER loser");
            return; 
        } else if (enemyHP <= 0) {
            alert("du vann??");
            return; 
        }

        console.log(`Ditt HP: ${playerHP} | Fiendens HP: ${enemyHP}`);

        currentRound++;
        currentEnergy = maxEnergy;
        updateEnergyUI();

        const cardsInHand = Array.from(hand.children);
        cardsInHand.forEach(card => {
            const cardData = JSON.parse(card.dataset.fullData);
            if (!cardData.isCore) {
                const baseCard = cardDatabase.find(c => c.name === cardData.name);
                playerDeck.push(baseCard);
            }
        });
        hand.innerHTML = ''; 
        
        shuffleDeck(playerDeck);
        updateDeckUI();

        aiBoardData.forEach(card => {
            if (!card.isCore) {
                const baseCard = cardDatabase.find(c => c.name === card.name);
                if (baseCard) {
                    aiDeck.push({ ...baseCard });
                }
            }
        });
        shuffleDeck(aiDeck);

        if (!coreEchoUnlocked) {
            let trialMet = false;
            if (myCoreEcho.name === "Inferno Rider" && (playerHP <= 15 || currentRound >= 5)) trialMet = true;
            else if (myCoreEcho.name === "Feilian Beringal" && (battlesLost >= 3 || currentRound >= 5)) trialMet = true;

            if (trialMet) {
                coreEchoUnlocked = true;
                hand.appendChild(createCard(myCoreEcho));
            }
        }

        if (!aiCoreEchoReady && !aiCoreEchoUsed) {
            let aiTrialMet = false;
            
            if (aiCoreEcho.name === "Inferno Rider" && (enemyHP <= 15 || currentRound >= 5)) {
                aiTrialMet = true;
            } else if (aiCoreEcho.name === "Feilian Beringal" && (aiBattlesLost >= 3 || currentRound >= 5)) {
                aiTrialMet = true;
            }

            if (aiTrialMet) {
                aiCoreEchoReady = true; 
                alert("core echo unlocked for AI");
            }
        }
        
        for (let i = 0; i < 4; i++) {
            drawCardFromDeck();
        }

        takeAITurn();
    });
});

const zones = [hand, frontline, backline, energyCircle, transformZone];

zones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        zone.classList.add('hovered');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('hovered');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('hovered');
        const draggingCard = document.querySelector('.dragging');
        if (!draggingCard) return;
        
        const cardCost = parseInt(draggingCard.dataset.cost);
        const isCoreCard = draggingCard.dataset.isCore === "true";
        const isBoardZone = (zone === frontline || zone === backline);

        // transform
        if (zone === transformZone) {
            const effect = draggingCard.dataset.transformEffect;

            if (!effect) {
                alert("detta kort har ingen transformeffekt");
                return;
            }

            if (currentEnergy < cardCost) {
                alert("inte tillräckligt med energi");
                return;
            }

            currentEnergy -= cardCost;
            if (effect === "draw3") {
                for (let i = 0; i < 3; i++) drawCardFromDeck();
                console.log("transform: draw 3 cards");
            }
            else if (effect === "energy3") {
                currentEnergy += 3;
                console.log("transform: gain 3 energy");
            }
            updateEnergyUI();
            draggingCard.remove();
            return;
        }

        if (zone === energyCircle) {
            currentEnergy++;
            updateEnergyUI();

            const cardData = JSON.parse(draggingCard.dataset.fullData);
            if (!cardData.isCore) {
                const baseCard = cardDatabase.find(c => c.name === cardData.name);
                playerDeck.push(baseCard);
                shuffleDeck(playerDeck);
                updateDeckUI();
            }
            
            draggingCard.remove(); 
            return;
        }

        const targetCard = e.target.closest('.card');

        if (targetCard && isBoardZone && draggingCard.parentElement === hand) {
            const cardA = draggingCard; 
            const cardB = targetCard;   

            const costA = parseInt(cardA.dataset.cost);
            const baseCostB = parseInt(cardB.dataset.baseCost);
            const modulationsB = parseInt(cardB.dataset.modulations);

            // Regler för Modulate
            if (cardA.dataset.isCore === "true" || cardB.dataset.isCore === "true") {
                alert("Du kan inte modulera Core Echoes!"); return;
            }
            if (modulationsB >= 2) {
                alert("Detta Echo kan max moduleras 2 gånger!"); return;
            }
            if (modulationsB === 0 && baseCostB !== 1) {
                alert("Modulation måste börja på ett 1-Cost Echo!"); return;
            }
            if (costA === 3 && modulationsB === 0) {
                alert("För att modulera ett 3-Cost Echo måste målet redan vara modulerat en gång!"); return;
            }
            if (currentEnergy < costA) {
                alert("Inte tillräckligt med energi!"); return;
            }

            currentEnergy -= costA;
            updateEnergyUI();

            // modulate draw 2
            const effectA = cardA.dataset.modulateEffect;

            if (effectA === "draw2") {
                console.log("Skill aktiverad: Draw 2 cards!");
                for (let i = 0; i < 2; i++) {
                    drawCardFromDeck();
                }
            } 

            const newStr = parseInt(cardA.dataset.str) + parseInt(cardB.dataset.str);
            const newDmg = parseInt(cardA.dataset.dmg) + parseInt(cardB.dataset.dmg);
            const newCon = parseInt(cardA.dataset.con) + parseInt(cardB.dataset.con);

            const dormantSkillB = cardB.dataset.specialSkill;
            const activeSkillB = cardB.dataset.activeSpecialSkill;
            const inheritedSkill = dormantSkillB || activeSkillB || ""; 

            const originalDataA = JSON.parse(cardA.dataset.fullData);
            const modulatedData = {
                ...originalDataA, 
                str: newStr, 
                dmg: newDmg, 
                con: newCon,
                activeSpecialSkill: inheritedSkill // Detta aktiverar förmågan!
            };

            const newModulatedCard = createCard(modulatedData, modulationsB + 1);

            cardB.replaceWith(newModulatedCard);
            cardA.remove(); 
            
            console.log("Modulation lyckades!");
            return; 
        }

        // Lägga ut kort på planen
        if (isBoardZone && draggingCard.parentElement !== zone) {
            if (zone.children.length >= 3) {
                alert("Max 3 kort i varje rad");
                return;
            }

            if (isCoreCard) {
                const existingCoresFront = Array.from(frontline.children).filter(c => c.dataset.isCore === "true");
                const existingCoresBack = Array.from(backline.children).filter(c => c.dataset.isCore === "true");
                
                if (existingCoresFront.length + existingCoresBack.length >= 1) {
                    alert("Endast 1 Core Echo tillåten");
                    return;
                }
            }

            if (draggingCard.parentElement === hand) {
                if (currentEnergy < cardCost) {
                    alert("Inte tillräckligt med energi!");
                    return;
                }
                currentEnergy -= cardCost;
                updateEnergyUI();
            }
        } 
        
        else if (zone === hand && (draggingCard.parentElement === frontline || draggingCard.parentElement === backline)) {
            currentEnergy += cardCost;
            updateEnergyUI();

            const cardData = JSON.parse(draggingCard.dataset.fullData);
            const baseCard = cardDatabase.find(c => c.name === cardData.name);
            const resetCard = createCard(baseCard);

            zone.appendChild(resetCard);
            draggingCard.remove(); 
            return;
        }

        zone.appendChild(draggingCard);
    });
});

function drawCardFromDeck() {
    if (playerDeck.length === 0) {
        console.log("Kortleken är tom!");
        return;
    }
    const drawnCardData = playerDeck.pop(); 
    hand.appendChild(createCard(drawnCardData));
    updateDeckUI();
}

updateDeckUI();
for (let i = 0; i < 4; i++) {
    drawCardFromDeck();
}

drawBtn.addEventListener('click', drawCardFromDeck);