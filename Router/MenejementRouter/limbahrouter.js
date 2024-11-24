import express from "express";
import multer from "multer"; // Menggunakan import untuk multer
import {storage, fileFilter, tambahLimbah, getAllLimbah, hapusLimbah, editLimbah } from "../../Controller/dashboardmenejement/limbahcontroller.js";

const router = express.Router();

// Konfigurasi multer untuk menyimpan file unggahan
const upload = multer({ storage, fileFilter });

// POST: Tambah Limbah
router.post("/limbah", tambahLimbah);

// GET: Ambil Semua Limbah
router.get("/limbah", getAllLimbah);

// DELETE: Hapus Limbah Berdasarkan ID
router.delete("/limbah/:id", hapusLimbah);

// PUT: Edit Limbah Berdasarkan ID
router.put("/limbah/:id", upload.single("gambar"), editLimbah);

export default router;
