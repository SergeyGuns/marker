require("dotenv").config();
const PORT = process.env.PORT || 3000;
const routerRoot = "./api/";
const express = require("express");
const app = express();
const cors = require("cors");
const database = require("./database");
const { initAPI } = require("./api");
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ message: "hi" });
});

const initServer = async () => {
  try {
    await database.start();
    const api = await initAPI(routerRoot);
    api.forEach((route) => app.use("/api", route(database)));
    app.listen(PORT, () => {
      console.log(`listening: http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
initServer();
