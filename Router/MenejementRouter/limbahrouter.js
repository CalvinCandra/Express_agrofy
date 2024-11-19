import express from "express";
import { tambahLimbah, getAllLimbah, hapusLimbah } from "../../Controller/dashboardmenejement/limbahcontroller.js";

const router = express.Router();

// POST: Tambah Limbah
router.post("/limbah", tambahLimbah);

// GET: Ambil Semua Limbah
router.get("/limbah", getAllLimbah);

// DELETE: Hapus Limbah Berdasarkan ID
router.delete("/limbah/:id", hapusLimbah);

export default router;
