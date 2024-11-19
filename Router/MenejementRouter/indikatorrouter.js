import express from "express";
import {
  getAllPengolahanLimbah,
  getPengolahanLimbahByStatus,
  getAllHasilOlahan,
  getHasilOlahanCount,
} from "../../Controller/dashboardmenejement/indikatorcontroller.js";

const router = express.Router();

// Route untuk semua pengolahan limbah
router.get("/", getAllPengolahanLimbah);

// Route untuk jumlah pengolahan limbah berdasarkan status
router.get("/count/:status", getPengolahanLimbahByStatus);

router.get("/", getAllHasilOlahan);

// Route untuk jumlah hasil olahan
router.get("/count", getHasilOlahanCount);


export default router;
