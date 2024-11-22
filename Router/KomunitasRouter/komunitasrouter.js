import express from "express";
import {
  getKomunitas,
  getKomunitasBalasan,
  tambahKomunitas,
  tambahBalasan,
} from "../../Controller/KomunitasController/komunitascontroller.js";
import { validasi } from "../../middleware/validasi.js";
import { uploadKomunitas } from "../../middleware/upload.js";

const komunitasrouter = express();

komunitasrouter.get("/getkomunitas", getKomunitas);
komunitasrouter.get("/getkomunitasbalasan/:id", getKomunitasBalasan);
komunitasrouter.post(
  "/tambahkomunitas",
  [uploadKomunitas.single("gambar"), validasi(["caption"])],
  tambahKomunitas
);
komunitasrouter.post("/tambahbalasan/:id", [
  validasi(["balasan"]),
  tambahBalasan,
]);

export default komunitasrouter;
