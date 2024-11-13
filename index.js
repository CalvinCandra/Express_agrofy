import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import koneksi from "./database/database.js";

// init .env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({ msg: "MUNCUL" });
});

app.listen(process.env.APP_PORT, async () => {
  await koneksi();
  console.log(`Server is running on http://localhost:${process.env.APP_PORT}`);
});
