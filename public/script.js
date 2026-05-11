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
let roundStrBuff = 0;
let roundConBuff = 0;
let roundDamageReduction = 0;

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
let cardCounts = {}; 

// const infernoDeckList = [
//     "Chop Chop Headless", "SpearBack", "Snip Snap", "Diggy Duggy", "Sabyr Boar", 
//     "Fusion Warrior", "Dwarf Cassowary", "Fission Junrock", "La Guardia", "Baby Viridblaze"
// ];

// const feilianDeckList = [
//     "Carapace", "Diggy Duggy", "Sabyr Boar", "Hoartoise", "Aero Predator", 
//     "Diamond Claw", "Vanguard Junrock", "Abyssal Patricius", "Cyan Feather", "Fission Junrock"
// ];

async function initGame() {
    const playerChoseCore = confirm("VÄLJ CORE ECHO\nOK = INFERNO RIDER\nAVBRYT = FEILIAN BERINGAL");

    let myDeckName = playerChoseCore ? "Inferno" : "Feilian";
    let aiDeckName = playerChoseCore ? "Feilian" : "Inferno";

    try {
        const playerResponse = await fetch(`http://localhost:3000/deck/${myDeckName}`);
        const playerRawCards = await playerResponse.json();
        
        let allPlayerCards = playerRawCards.map(dbData => formatCardData(dbData));

        myCoreEcho = allPlayerCards.find(c => c.isCore);
        let normalCards = allPlayerCards.filter(c => !c.isCore);

        playerDeck = [];
        normalCards.forEach(card => {
            playerDeck.push({ ...card });
            playerDeck.push({ ...card });
        });

        const aiResponse = await fetch(`http://localhost:3000/deck/${aiDeckName}`);
        const aiRawCards = await aiResponse.json();
        let allAICards = aiRawCards.map(dbData => formatCardData(dbData));

        aiCoreEcho = allAICards.find(c => c.isCore);
        let aiNormalCards = allAICards.filter(c => !c.isCore);

        aiDeck = [];
        aiNormalCards.forEach(card => {
            aiDeck.push({ ...card });
            aiDeck.push({ ...card });
        });

        shuffleDeck(playerDeck);
        shuffleDeck(aiDeck);
        
        updateDeckUI();
        
        hand.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            drawCardFromDeck();
        }
        takeAITurn();

    } catch (error) {
        console.error("Kunde inte hämta korten från databasen:", error);
    }
}

function formatCardData(dbData) {
    return {
        id: dbData.id,
        name: dbData.name,
        cost: dbData.cost,
        str: dbData.str,
        dmg: dbData.dmg,
        con: dbData.con,
        isCore: dbData.is_core === 1,
        transformEffect: dbData.transform_effect || "",
        transformCost: dbData.transform_cost || dbData.cost,
        modulateEffect: dbData.modulate_effect || "",
        specialSkill: dbData.special_effect || "",
        skillText: dbData.skill_text || "",
        tempStr: 0,
        tempCon: 0,
        buffDuration: 0,
        activeSpecialSkill: ""
    };
}

initGame();

function updateHPUI() {
    if (playerHpText) playerHpText.innerText = playerHP;
    if (enemyHpText) enemyHpText.innerText = enemyHP;
}
updateHPUI();

function updateDeckUI() {
    deckCountText.innerText = playerDeck.length;
}

function updateAllCardsUI() {
    const allCards = document.querySelectorAll('.card');
    
    allCards.forEach(card => {
        const isOnBoard = card.closest('#frontline') || card.closest('#backline');
        
        const strEl = card.querySelector('.stat-str');
        const conEl = card.querySelector('.stat-con');
        
        if (strEl && conEl) {
            const baseStr = parseInt(card.dataset.str) || 0;
            const baseCon = parseInt(card.dataset.con) || 0;
            
            const tempStr = parseInt(card.dataset.tempStr) || 0;
            const tempCon = parseInt(card.dataset.tempCon) || 0;
            
            const totalRoundStr = (typeof roundStrBuff !== 'undefined') ? roundStrBuff : 0;
            const totalRoundCon = (typeof roundConBuff !== 'undefined') ? roundConBuff : 0;

            const extraStr = isOnBoard ? (totalRoundStr + tempStr) : 0;
            const extraCon = isOnBoard ? (totalRoundCon + tempCon) : 0;
            
            const currentStr = baseStr + extraStr;
            const currentCon = baseCon + extraCon;
            
            strEl.innerHTML = `⚔️ ${currentStr}`;
            conEl.innerHTML = `❤️ ${currentCon}`;
            
            strEl.style.color = extraStr > 0 ? '#2ecc71' : '';
            conEl.style.color = extraCon > 0 ? '#2ecc71' : '';
            
            // Debug-logg (ta bort denna när det fungerar)
            if (isOnBoard && (tempStr > 0 || tempCon > 0)) {
                console.log(`Visar buff för ${card.dataset.name}: +${tempStr} STR från Echo Skill`);
            }
        }
    });
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
    card.dataset.cost = cardData.cost;
    card.dataset.transformEffect = cardData.transformEffect || "";
    card.dataset.transformCost = cardData.transformCost !== undefined ? cardData.transformCost : cardData.cost;
    card.dataset.baseCost = cardData.cost; 
    card.dataset.str = cardData.str;
    card.dataset.dmg = cardData.dmg;
    card.dataset.con = cardData.con;
    card.dataset.isCore = cardData.isCore ? "true" : "false";
    card.dataset.modulations = existingModulations; // startar på 0
    card.dataset.modulateEffect = cardData.modulateEffect || "";
    card.dataset.activeEffect = cardData.activeEffect || "";
    cardData.tempStr = cardData.tempStr || 0;
    cardData.tempCon = cardData.tempCon || 0;
    cardData.buffDuration = cardData.buffDuration || 0;
    card.dataset.tempStr = cardData.tempStr;
    card.dataset.tempCon = cardData.tempCon;
    card.dataset.buffDuration = cardData.buffDuration;
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
        ${cardData.activeSpecialSkill ? `<div class="active-skill" style="font-size: 10px; color: #e74c3c; font-weight: bold; text-align: center;">🔥 ${cardData.activeSpecialSkill.toUpperCase()} ACTIVATED!</div>` : ''}
        <div class="card-stats">
            <span class="stat-str" title="Strength">⚔️ ${cardData.str}</span>
            <span class="stat-dmg" title="Damage">💥 ${cardData.dmg}</span>
            <span class="stat-con" title="Constitution (HP)">❤️ ${cardData.con}</span>
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

        if (roundStrBuff > 0) {
            updatedCard.str += roundStrBuff;
        }

        if (roundConBuff > 0) {
            updatedCard.con += roundConBuff;
        }

        if (updatedCard.tempStr > 0) updatedCard.str += updatedCard.tempStr;
        if (updatedCard.tempCon > 0) updatedCard.con += updatedCard.tempCon;

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
        // lägger dessa två här för att säkra att spelet bara applicerar effekterna tillförlitligt när korten faktiskt befinner sig på brädet
        if (updatedCard.name === "Abyssal Patricius") {
            if (currentRound <= 4) {
                updatedCard.str += 2;
                updatedCard.con += 2;
                console.log(`[ECHO SKILL] Abyssal Patricius fick +2 STR/CON (Aktiv i runda ${currentRound}/4).`);
            } else {
                console.log(`[ECHO SKILL] Abyssal Patricius effekt är inaktiv (Runda ${currentRound} är över gränsen).`);
            }
        }
        // lägger dessa två här för att säkra att spelet bara applicerar effekterna tillförlitligt när korten faktiskt befinner sig på brädet
        if (updatedCard.name === "Carapace") {
            updatedCard.dmg += 3;
            console.log(`[ECHO SKILL] Carapace anpassade effekt ger +3 extra DMG i striden!`);
        }

        return updatedCard;
    });

    // flank force
    const hasFlankForce = playerCardsData.some(card => card.specialSkill === "flank-force" || card.activeSpecialSkill === "flank-force");
    
    if (hasFlankForce && playerCardsData.length === 3) {
        console.log("[FLANK FORCE] Aktiverad! Exakt 3 Echoes på brädet. Alla får +1 DMG.");
        playerCardsData = playerCardsData.map(card => {
            let updatedCard = { ...card };
            updatedCard.dmg += 1;
            return updatedCard;
        });
    }

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
            const damageTaken = Math.max(0, combatResult.enemyDamageDealt - roundDamageReduction);
            playerHP -= damageTaken;
            battlesLost++;
            
            if (roundDamageReduction > 0) {
                alert(`Motståndare vann. Du tog ${damageTaken} i skada (Ditt skal blockade ${roundDamageReduction}!).`);
            } else {
                alert(`Motståndare vann. Du tog ${damageTaken} i skada.`);
            }
            
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
        roundStrBuff = 0;
        roundConBuff = 0;
        roundDamageReduction = 0;
        const boardCardsElements = [...frontline.children, ...backline.children];
        boardCardsElements.forEach(cardEl => {
            let cardData = JSON.parse(cardEl.dataset.fullData);
            if (cardData.buffDuration > 0) {
                cardData.buffDuration -= 1;
                
                if (cardData.buffDuration <= 0) {
                    cardData.tempStr = 0;
                    cardData.tempCon = 0;
                    console.log(`[TIMEOUT] ${cardData.name} tappade sin temporära Modulate-buff.`);
                }
                
                cardEl.dataset.tempStr = cardData.tempStr;
                cardEl.dataset.tempCon = cardData.tempCon;
                cardEl.dataset.buffDuration = cardData.buffDuration;
                cardEl.dataset.fullData = JSON.stringify(cardData);
            }
        });
        updateEnergyUI();
        updateAllCardsUI();

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
            const transformCost = parseInt(draggingCard.dataset.transformCost); // Använd transformCost

            if (!effect) {
                alert("Detta kort har ingen transformeffekt");
                return;
            }

            if (currentEnergy < transformCost) {
                alert(`Inte tillräckligt med energi! Transformen kostar ${transformCost}.`);
                return;
            }

            currentEnergy -= transformCost; // Dra rätt mängd energi

            if (effect === "draw3") {
                for (let i = 0; i < 3; i++) drawCardFromDeck();
                console.log("Transform: Draw 3 cards");
            }
            else if (effect === "energy3") {
                currentEnergy += 3;
                console.log("Transform: Gain 3 energy");
            }
            else if (effect === "strBuff1") {
                roundStrBuff += 1;
                console.log(`Transform: Alla dina Echoes får +1 STR denna runda! (Total: +${roundStrBuff})`);
            }
            // chop chop headless transform
            else if (effect === "chopChopBuff") {
                roundStrBuff += 2;
                roundConBuff += 1;
                console.log(`Transform: Alla dina Echoes får +2 STR och +1 CON denna runda!`);
            }
            // fission junrock transform
            else if (effect === "discoverCost1") {
                const cost1Cards = playerDeck.filter(c => c.cost === 1);
                
                if (cost1Cards.length === 0) {
                    alert("Du har inga 1-cost kort kvar i leken!");
                    currentEnergy += transformCost; 
                    return;
                }

                const options = cost1Cards.slice(0, 3);
                let promptText = "Välj ett kort att lägga till i handen (skriv en siffra):\n\n";
                
                options.forEach((c, index) => {
                    promptText += `${index + 1}: ${c.name} (STR: ${c.str}, DMG: ${c.dmg}, CON: ${c.con})\n`;
                });

                let choice = prompt(promptText);
                let selectedIndex = parseInt(choice) - 1;

                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
                    alert("Ogiltigt val eller avbrutet. Första kortet valdes automatiskt.");
                    selectedIndex = 0;
                }

                const chosenCard = options[selectedIndex];

                const deckIndex = playerDeck.findIndex(c => c === chosenCard);
                if (deckIndex !== -1) {
                    playerDeck.splice(deckIndex, 1);
                }

                hand.appendChild(createCard(chosenCard));
                
                shuffleDeck(playerDeck);
                updateDeckUI();
                console.log(`Transform: Valde ${chosenCard.name} från leken.`);
            }
            // hoartoise transform
            else if (effect === "hoartoiseBlock") {
                roundDamageReduction += 3; 
                console.log(`Transform: Hoartoise! Tar ${roundDamageReduction} mindre skada denna runda.`);
            }
            // cyan feather transform
            else if (effect === "cyanFeatherHeal") {
                const healAmount = 6; 
                playerHP = Math.min(20, playerHP + healAmount);
                updateHPUI();
                console.log(`Transform: Cyan Feather! Helade ${healAmount} HP.`);
            }

            updateEnergyUI();
            draggingCard.remove();
            updateAllCardsUI();
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

            const nameA = JSON.parse(cardA.dataset.fullData).name;
            const nameB = JSON.parse(cardB.dataset.fullData).name;

            let tempStr = parseInt(cardB.dataset.tempStr) || 0;
            let tempCon = parseInt(cardB.dataset.tempCon) || 0;
            let buffDuration = parseInt(cardB.dataset.buffDuration) || 0;



            const boardCards = [...frontline.children, ...backline.children];
            const hasFlankForce = boardCards.some(el => {
                const d = JSON.parse(el.dataset.fullData);
                return d.specialSkill === "flank-force" || d.activeSpecialSkill === "flank-force";
            });
            const isFlankForceActive = hasFlankForce && boardCards.length === 3;

            // orkar inte göra om så att jag skriver på cards.js
            if ((nameA === "SpearBack" || nameB === "SpearBack") && isFlankForceActive) {
                tempStr += 2;
                tempCon += 2;
                buffDuration = Math.max(buffDuration, 2); // Räcker i 2 rundor
                console.log("[ECHO SKILL] Spearback modulerades med Flank Force! +2 STR/CON i 2 rundor.");
            }

            // orkar inte göra om så att jag skriver på cards.js
            if (nameA === "Baby Viridblaze" || nameB === "Baby Viridblaze") {
                tempStr += 2;
                tempCon += 1;
                buffDuration = Math.max(buffDuration, 1); 
                console.log("[ECHO SKILL] Baby Viridblaze modulerades! +2 STR och +1 CON denna runda.");
            }

            const originalDataA = JSON.parse(cardA.dataset.fullData);
            const modulatedData = {
                ...originalDataA, 
                str: newStr, 
                dmg: newDmg, 
                con: newCon,
                activeSpecialSkill: inheritedSkill,
                tempStr: tempStr,          
                tempCon: tempCon,          
                buffDuration: buffDuration 
            };

            const newModulatedCard = createCard(modulatedData, modulationsB + 1);

            const targetZone = targetCard.parentElement;
            targetZone.replaceChild(newModulatedCard, targetCard);
            draggingCard.remove();

            console.log("Modulation lyckades!");
            updateAllCardsUI();
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
        updateAllCardsUI();
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
    updateAllCardsUI();
}

updateDeckUI();
for (let i = 0; i < 4; i++) {
    drawCardFromDeck();
}

drawBtn.addEventListener('click', drawCardFromDeck);