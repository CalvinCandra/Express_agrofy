import express from "express";
import {
  getKategori,
  tambahKategori,
  updateKategori,
  deleteKategori,
} from "../../Controller/KategoriController/kategoricontroller.js";
import { validasi } from "../../middleware/validasi.js";

const kategorirouter = express();

kategorirouter.get("/getkategori", getKategori);
kategorirouter.post("/tambahkategori", [
  validasi(["nama_kategori"]),
  tambahKategori,
]);
kategorirouter.put("/updatekategori/:id", [
  validasi(["nama_kategori", "id"]),
  updateKategori,
]);
kategorirouter.delete("/deletekategori/:id", [
  validasi(["id"]),
  deleteKategori,
]);

export default kategorirouter;
