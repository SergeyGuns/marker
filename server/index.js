require("dotenv").config();
const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const cors = require("cors");
const database = require("./database");
const router = require("./routes");
app.use(cors());
app.use(express.json());
app.use("/api", router);
app.get("/", (req, res) => {
  res.status(200).json({ message: "hi" });
});

const initServer = async () => {
  try {
    await database.start();
    app.listen(PORT, () => {
      console.log(`listening: http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
initServer();
