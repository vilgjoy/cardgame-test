import 'dotenv/config'
import express from "express"
import nunjucks from "nunjucks"
// 1. Importera din router från routes-mappen
import indexRouter from "./routes/index.js" 

const app = express()
app.use(express.static('public'))

nunjucks.configure("views", {
    autoescape: true,
    express: app
})

app.use("/", indexRouter); 

app.get("/", (req, res) => {
    res.render("index.njk", {
        title: "Card Game",
        message: "Welcome to the card game!"
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})