Detta tog mycket längre än vad jag trodde men i slutändan så fungerar allting och det är vad jag tycker är viktigast. Jag kan tog säga att jag tog ganska mycket kodning och info från youtubern Drew Conley (https://www.youtube.com/@DrewConley) och Chris Courses (https://www.youtube.com/@ChrisCourses).

Till själva arbetet startade det ganska simpelt. Jag tog en wsp1-boilerplate och laddade ner allting som behövdes, samt dotenv och mysql2 Började med att skapa en liten platta, sedan göra korten och hur man rörde dem och placerade dem. När både dessa var gjorda så började jag kolla på videos och liknande för hur man ska programmera för kortspel. Så då gjorde jag cards.js, som var en fil som hade varje kort, dess effect, stats, text och liknande. Detta har jag tagit bort nu för jag använder en databas som gör likadant. När man kunde placera ut kort och korten hade riktiga stats, gjorde jag en combat zone (combat.js) som är en liten zone som gör om dina kort till små bollar som åker runt i zonen tills motståndarens eller dina bollar är död. Resten av min tid spenderas på att kunna göra effekterna i script.js på korten. Jag tog insperation från spelet "Peaks of Prestige" och kunde använda den logiken med det jag hade fått från Drew eller Chris. Så sammanfattat vad mina större filer gör:

index.js definierar en Express-router som läser kortdata från databasen för en given lek och returnerar det som JSON 

script.js är Spelklienten. Den laddar kort från servern, hanterar spelstart, kortdragning, brädeslogik, AI, drag-and-drop, energi, rundhantering och skickar ut kamp.

combat.js Renderar och simulerar strid i en canvas med cirklar för varje kort, kollisionsbaserad skada och fatigue-logik.

index.njk HTML-mallen för spelets sida: layout, spelplan, hand, energi, HP och script-tagg.

database.js skapar en MySQL-anslutningspool med mysql2/promise för databasen

Jag vet inte hur mycket jag har lärt mig vid denna period. Det mesta jag gjorde var att följa en tutorial på youtube och själva kortspelet är av andra. Det jag dock kan säga är att jag lärde mig ganska mycket kring databaser. Hur man gjorde en, hur man kunde använda en och sedan hur man kunde koppla det med sin nuvarande kod. Speciellt med att använda SQL och kunna hosta det på render.com. Att kunna hosta tog två lektioner och det slutade med att jag exporterade min SQL fil på min databas och la in det i min db.js. 

Jag la upp detta på WAVE där jag fick ganska många kontrast error på varje kort och mycket liten text på korten. Varför det är liten text var för att jag inte vill stretcha ut korten, så texten behöver vara liten. För kontrast errors så tog jag färger där man kunde se texten på ett vitt kort.

Jag har använt mig av ganska många tekniker som jag fick från de olika videorna, och såklart Jens hemsida, to name a few: Express + MySQL som ger snabb server-API för att hämta speldata från DB, ES-moduler + async/await som förbättrar läsbarheten och hanteringen av asynkrona flöden, Fetch + DOM + drag-and-drop som gör klienten interaktiv utan tunga ramverk, Canvas + requestAnimationFrame som är lämpligt för realtidsanimationer (stridssimulering),
Nunjucks ger enkel server-rendering för start-HTML medan klienten hanterar dynamik.
