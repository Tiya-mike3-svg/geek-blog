// ===============================
// GeekHub News Blog - Node Only
// ===============================

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "articles.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public")); // frontend files

// ===============================
// Load articles from JSON file
// ===============================
let articles = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    articles = JSON.parse(fs.readFileSync(DATA_FILE));
    console.log("Loaded articles from JSON ✅");
  } catch (e) {
    console.error("Error parsing JSON:", e);
    articles = [];
  }
}

// ===============================
// Save articles to JSON file (batched to avoid blocking)
// ===============================
let saveScheduled = false;
function saveArticles() {
  if (!saveScheduled) {
    saveScheduled = true;
    setTimeout(() => {
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
        console.log("Articles saved to JSON ✅");
      } catch (e) {
        console.error("Error saving JSON:", e);
      }
      saveScheduled = false;
    }, 2000); // save every 2 seconds
  }
}

// ===============================
// Routes
// ===============================

// Home route
app.get("/", (req, res) => {
  res.send("GeekHub server is running 🚀");
});

// Get all articles
app.get("/articles", (req, res) => {
  res.json(articles.sort((a, b) => b.id - a.id));
});

// Add new article
app.post("/articles", (req, res) => {
  const { title, content, category, image } = req.body;
  const id = articles.length ? articles[articles.length - 1].id + 1 : 1;

  articles.push({
    id,
    title,
    content,
    category,
    image,
    likes: 0,
    fav: false,
    comments: []
  });

  saveArticles();
  res.json({ message: "Article added successfully ✅" });
});

// Like article
app.post("/articles/:id/like", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (article) article.likes++;
  saveArticles();
  res.json({ message: "Liked ✅" });
});

// Favourite article
app.post("/articles/:id/favourite", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (article) article.fav = true;
  saveArticles();
  res.json({ message: "Favourited ✅" });
});

// Add comment
app.post("/articles/:id/comment", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (article) {
    article.comments.push(req.body.comment);
    saveArticles();
  }
  res.json({ message: "Comment added ✅" });
});

// ===============================
// Start server
// ===============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});