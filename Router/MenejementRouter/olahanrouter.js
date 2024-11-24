import express from "express";
import {
  tambahPengolahanLimbah,
  getAllPengolahanLimbah,
  hapusPengolahanLimbah,
  getDetailPengolahanLimbah,
  editPengolahanLimbah
  
} from "../../Controller/dashboardmenejement/olahlimbahcontroller.js";

const router = express.Router();

// Endpoint: Tambah Pengolahan Limbah
router.post("/olah", tambahPengolahanLimbah); 

// Endpoint: Ambil Semua Pengolahan Limbah
router.get("/olah", getAllPengolahanLimbah);

router.get("/olah/:id", getDetailPengolahanLimbah);

// Endpoint: Hapus Pengolahan Limbah
router.delete("/olah/:id", hapusPengolahanLimbah);

router.put("/olah/:id", editPengolahanLimbah);

export default router;
