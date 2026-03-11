const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

/* NEON POSTGRES CONNECTION */

const pool = new Pool({
  connectionString: "Ppostgresql://neondb_owner:npg_TNAyKq8utFC5@ep-rapid-pond-agyqpcsb-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
.then(() => console.log("Connected to Neon database"))
.catch(err => console.error("Database connection error", err));

/* GET ARTICLES */

app.get("/articles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articles ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.send(err);
  }
});

/* ADD ARTICLE */

app.post("/articles", async (req, res) => {

  const { title, content, category, image } = req.body;

  try {
    await pool.query(
      "INSERT INTO articles (title, content, category, image) VALUES ($1,$2,$3,$4)",
      [title, content, category, image]
    );

    res.json({ message: "Article added" });

  } catch (err) {
    res.send(err);
  }

});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});