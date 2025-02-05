require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const router = express.Router();
const routes = require("./routes");
const hostname = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.listen(port, hostname, () => {
  console.log(`Serveur démarré sur http://${hostname}:${port}`);
});
