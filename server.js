const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const router = require("./routers");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

const db = require("./dbConfig");
db.connect();

app.use(cors());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.json());

app.use("/api", router);
app.use("/uploads", express.static(path.join(__dirname, "/../uploads")));

// Adjust the static file serving
app.use(express.static(path.join(__dirname, "../frontend/builds")));

app.get("*", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "frontend", "builds", "index.html"));
  } catch (e) {
    console.error("Error serving index.html:", e);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Stack Overflow Clone is running on PORT No ${PORT}`);
});


