import express from "express";
import {
  getArtikel,
  getArtikelDetail,
  deleteArtikel,
  updateArtikel,
  tambahArtikel,
} from "../../Controller/ArtikelController/artikelcontroller.js";
import { validasi } from "../../middleware/validasi.js";
import { uploadArtikel } from "../../middleware/upload.js";

const artikelrouter = express();

artikelrouter.get("/getartikel", getArtikel);
artikelrouter.get("/getartikeldetail/:id", getArtikelDetail);
artikelrouter.post(
  "/tambahartikel",
  [
    uploadArtikel.single("thumbnail"),
    validasi(["judul", "deskripsi", "email", "kategori_id"]),
  ],
  tambahArtikel
);
artikelrouter.put(
  "/updateartikel/:id",
  [
    uploadArtikel.single("thumbnail"),
    validasi(["judul", "deskripsi", "email", "kategori_id"]),
  ],
  updateArtikel
);
artikelrouter.delete("/deleteartikel/:id", deleteArtikel);

export default artikelrouter;
