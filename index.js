import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { koneksi } from "./database/database.js";
import Router from "./Router/index.js";
import path from "path";
import { fileURLToPath } from "url";

// init .env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(Router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// kirim link alias untuk di akses di react
app.use("/artikel", express.static(path.join(__dirname, "upload/artikel")));

app.listen(process.env.APP_PORT, async () => {
  await koneksi();
  console.log(`Server is running on http://localhost:${process.env.APP_PORT}`);
});
