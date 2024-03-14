const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const router = require("./routers");
const PORT = process.env.PORT || 5000;

const db = require("./dbConfig");
db.connect();

app.use(cors());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.json());

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Stack Overflow Clone is running on PORT No ${PORT}`);
});


