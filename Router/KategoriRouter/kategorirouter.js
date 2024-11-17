import express from "express";
import {
  getKategori,
  tambahKategori,
  updateKategori,
  deleteKategori,
} from "../../Controller/KategoriController/kategoricontroller.js";

const kategorirouter = express();

kategorirouter.get("/getkategori", getKategori);
kategorirouter.post("/tambahkategori", tambahKategori);
kategorirouter.put("/updatekategori/:id", updateKategori);
kategorirouter.delete("/deletekategori/:id", deleteKategori);

export default kategorirouter;
