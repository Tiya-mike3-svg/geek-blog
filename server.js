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

// 🔥 Ensure uploads folder exists
const uploadFolder = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

// ===============================
// Load articles from JSON file
// ===============================
let articles = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    articles = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) { articles = []; }
}

// ===============================
// Save articles to JSON file
// ===============================
let saveScheduled = false;
function saveArticles() {
  if (!saveScheduled) {
    saveScheduled = true;
    setTimeout(() => {
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2)); } 
      catch (e) { console.error(e); }
      saveScheduled = false;
    }, 2000);
  }
}

// ===============================
// Routes
// ===============================

// Home
app.get("/", (req, res) => res.send("GeekHub server running 🚀"));

// Get all visible articles
app.get("/articles", (req, res) => {
  const visible = articles.filter(a => !a.unseen);
  res.json(visible.sort((a,b) => b.id - a.id));
});

// Add article
app.post("/articles", (req,res) => {
  const { title, content, category, image, author, authorImage } = req.body;
  const id = articles.length ? articles[articles.length-1].id+1 : 1;

  articles.push({ id, title, content, category, image, likes:0, fav:false, comments:[], unseen:false, author: author||"GeekHub Team", authorImage: authorImage||"" });
  saveArticles();
  res.json({ message:"Article added ✅" });
});

// Like
app.post("/articles/:id/like", (req,res) => {
  const a = articles.find(a => a.id==req.params.id);
  if(a) a.likes++;
  saveArticles();
  res.json({ message:"Liked ✅" });
});

// Favourite
app.post("/articles/:id/favourite", (req,res) => {
  const a = articles.find(a => a.id==req.params.id);
  if(a) a.fav=true;
  saveArticles();
  res.json({ message:"Favourited ✅" });
});

// Comment
app.post("/articles/:id/comment", (req,res) => {
  const a = articles.find(a => a.id==req.params.id);
  if(a) { a.comments.push(req.body.comment); saveArticles(); }
  res.json({ message:"Comment added ✅" });
});

// Update
app.put("/articles/:id", (req,res) => {
  const { title, content, category, image, author, authorImage } = req.body;
  const a = articles.find(a => a.id===Number(req.params.id));
  if(!a) return res.status(404).json({ message:"Not found ❌" });
  a.title=title; a.content=content; a.category=category; a.image=image; a.author=author||a.author; a.authorImage=authorImage||a.authorImage;
  saveArticles();
  res.json({ message:"Article updated ✅" });
});

// Soft delete
app.delete("/articles/:id", (req,res) => {
  const a = articles.find(a => a.id==req.params.id);
  if(!a) return res.status(404).json({ message:"Not found ❌" });
  a.unseen=true;
  saveArticles();
  res.json({ message:"Marked unseen ✅" });
});

// Upload images
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null,path.join(__dirname,"public/uploads")),
  filename: (req,file,cb)=> cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.post("/upload", upload.single("image"), (req,res)=>{
  if(!req.file) return res.status(400).json({ error:"No file uploaded" });
  res.json({ path:"/uploads/"+req.file.filename });
});

// Start server
app.listen(PORT,"0.0.0.0",()=>console.log(`Server running on http://localhost:${PORT}`));