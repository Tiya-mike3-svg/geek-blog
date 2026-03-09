const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

/* MYSQL CONNECTION */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cloudy_db"
});

db.connect(err => {
    if (err) {
        console.log("Database connection failed");
        return;
    }
    console.log("MySQL Connected");
});

/* GET ARTICLES */

app.get("/articles", (req, res) => {
    db.query("SELECT * FROM articles ORDER BY id DESC", (err, result) => {
        if (err) return res.send(err);
        res.json(result);
    });
});

/* ADD ARTICLE */

app.post("/articles", (req, res) => {

    const {title, content, category, image} = req.body;

    const sql = "INSERT INTO articles (title, content, category, image) VALUES (?,?,?,?)";

    db.query(sql, [title, content, category, image], (err, result) => {

        if (err) return res.send(err);

        res.json({message:"Article added"});
    });

});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});