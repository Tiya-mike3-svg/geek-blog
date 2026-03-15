const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public")); // your frontend files

/* ===============================
   MYSQL CONNECTION (FreeSQL)
   =============================== */
const db = mysql.createConnection({
  host: "sql8.freesqldatabase.com",
  user: "sql8820096",
  password: "SybGIfXQJn",
  database: "sql8820096",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("Connected to FreeSQL database ✅");
  }
});

/* ===============================
   HOME ROUTE
   =============================== */
app.get("/", (req, res) => {
  res.send("GeekHub server is working 🚀");
});

/* ===============================
   GET ARTICLES
   =============================== */
app.get("/articles", (req, res) => {
  const sql = "SELECT * FROM articles ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    results.forEach(a => {
      if (a.comments) a.comments = JSON.parse(a.comments);
      else a.comments = [];
    });

    res.json(results);
  });
});

/* ===============================
   ADD ARTICLE
   =============================== */
app.post("/articles", (req, res) => {
  const { title, content, category, image } = req.body;
  const sql = "INSERT INTO articles (title, content, category, image) VALUES (?,?,?,?)";

  db.query(sql, [title, content, category, image], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Article added successfully ✅" });
  });
});

/* ===============================
   LIKE ARTICLE
   =============================== */
app.post("/articles/:id/like", (req, res) => {
  const articleId = req.params.id;
  const sql = "UPDATE articles SET likes = likes + 1 WHERE id = ?";

  db.query(sql, [articleId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Liked ✅" });
  });
});

/* ===============================
   FAVOURITE ARTICLE
   =============================== */
app.post("/articles/:id/favourite", (req, res) => {
  const articleId = req.params.id;
  const sql = "UPDATE articles SET favourites = favourites + 1 WHERE id = ?";

  db.query(sql, [articleId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Favourited ✅" });
  });
});

/* ===============================
   ADD COMMENT
   =============================== */
app.post("/articles/:id/comment", (req, res) => {
  const articleId = req.params.id;
  const { comment } = req.body;

  db.query("SELECT comments FROM articles WHERE id = ?", [articleId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let comments = [];
    if (results[0] && results[0].comments) {
      comments = JSON.parse(results[0].comments);
    }

    comments.push(comment);

    db.query(
      "UPDATE articles SET comments = ? WHERE id = ?",
      [JSON.stringify(comments), articleId],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Comment added ✅" });
      }
    );
  });
});

/* ===============================
   START SERVER
   =============================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});