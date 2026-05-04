import express from "express" // ESM
import nunjucks from "nunjucks"
const app = express()
app.use(express.static('public'))

nunjucks.configure("views", {
    autoescape: true,
    express: app
})

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