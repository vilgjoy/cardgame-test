// En klass för våra ekon när de blir cirklar
class EchoCircle {
    constructor(cardData, isPlayer, canvasWidth, canvasHeight) {
        this.name = cardData.name;
        this.str = parseInt(cardData.str);
        this.dmg = parseInt(cardData.dmg);
        this.hp = parseInt(cardData.con); // Constitution = HP
        this.maxHp = this.hp;
        this.isPlayer = isPlayer;
        
        this.radius = 25;
        this.color = isPlayer ? '#3498db' : '#e74c3c'; 

        this.x = isPlayer ? Math.random() * (canvasWidth / 2 - 50) + 50 : Math.random() * (canvasWidth / 2 - 50) + canvasWidth / 2;
        this.y = Math.random() * (canvasHeight - 100) + 50;

        const speed = 3;
        this.vx = (Math.random() - 0.5) * speed * 2;
        this.vy = (Math.random() - 0.5) * speed * 2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Rita HP-text i mitten
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hp, this.x, this.y);
    }

    move(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) this.vx *= -1;
        if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) this.vy *= -1;
        
        this.x = Math.max(this.radius, Math.min(this.x, canvasWidth - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, canvasHeight - this.radius));
    }
}

// BARA EN startCombat-funktion!
export function startCombat(canvas, playerCards, enemyCards, onCombatComplete) {
    const ctx = canvas.getContext('2d');
    let animationId;

    // Fatigue-variabler
    let startTime = Date.now();
    const fatigueDelay = 15000; // 15 sekunder innan skadan börjar
    const fatigueInterval = 1000; // Skada sker varje sekund (1000ms)
    let lastFatigueTick = 0;
    let fatigueDamage = 1; 

    let circles = [
        ...playerCards.map(c => new EchoCircle(c, true, canvas.width, canvas.height)),
        ...enemyCards.map(c => new EchoCircle(c, false, canvas.width, canvas.height))
    ];

    // Det är här all matte som räknar ut krockar sker!
    function checkCollisions() {
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                const c1 = circles[i];
                const c2 = circles[j];

                if (c1.isPlayer === c2.isPlayer) continue;

                const dx = c1.x - c2.x;
                const dy = c1.y - c2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < c1.radius + c2.radius) {
                    c1.hp -= c2.str;
                    c2.hp -= c1.str;

                    c1.vx *= -1;
                    c1.vy *= -1;
                    c2.vx *= -1;
                    c2.vy *= -1;

                    c1.x += c1.vx * 2;
                    c1.y += c1.vy * 2;
                    c2.x += c2.vx * 2;
                    c2.y += c2.vy * 2;
                }
            }
        }
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        //FATIGUE LOGIK 
        if (elapsed > fatigueDelay) {
            if (currentTime - lastFatigueTick > fatigueInterval) {
                circles.forEach(c => {
                    c.hp -= fatigueDamage; 
                });
                lastFatigueTick = currentTime;
                fatigueDamage++; 
                console.log("FATIGUE! Alla tar skada.");
            }

            ctx.fillStyle = "rgba(231, 76, 60, 0.5)";
            ctx.font = "bold 20px Arial";
            ctx.fillText("SUDDEN DEATH: FATIGUE ACTIVE", canvas.width / 2, 30);
        }

        circles.forEach(c => {
            c.move(canvas.width, canvas.height);
            c.draw(ctx);
        });

        checkCollisions();

        circles = circles.filter(c => c.hp > 0);

        const playerAlive = circles.some(c => c.isPlayer);
        const enemyAlive = circles.some(c => !c.isPlayer);

        if (!playerAlive || !enemyAlive) {
            cancelAnimationFrame(animationId);
            
            const survivingPlayerDMG = circles
                .filter(c => c.isPlayer)
                .reduce((total, c) => total + c.dmg, 0);

            const survivingEnemyDMG = circles
                .filter(c => !c.isPlayer)
                .reduce((total, c) => total + c.dmg, 0);

            setTimeout(() => {
                onCombatComplete({
                    playerWon: playerAlive && !enemyAlive,
                    draw: !playerAlive && !enemyAlive,
                    playerDamageDealt: survivingPlayerDMG,
                    enemyDamageDealt: survivingEnemyDMG
                });
            }, 1000);
            return;
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    gameLoop();
}