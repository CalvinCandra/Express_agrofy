import express from "express";
import {
  getArtikel,
  getArtikelDetail,
  deleteArtikel,
  updateArtikel,
  tambahArtikel,
} from "../../Controller/ArtikelController/artikelcontroller.js";

const artikelrouter = express();

artikelrouter.get("/getartikel", getArtikel);
artikelrouter.get("/getartikeldetail/:id", getArtikelDetail);
artikelrouter.post("/tambahartikel", tambahArtikel);
artikelrouter.put("/updateartikel/:id", updateArtikel);
artikelrouter.delete("/deleteartikel/:id", deleteArtikel);

export default artikelrouter;
