// routes/dashboardmenejement/riwayatRouter.js

import express from "express";
import multer from "multer"; 
import { getRiwayatLimbah, edithasilolahan, storage, fileFilter, getJumlahOlahan  } from "../../Controller/dashboardmenejement/riwayatcontroller.js";

const router = express.Router();
const upload = multer({ storage, fileFilter });

// Definisikan route untuk mendapatkan riwayat limbah
router.get('/riwayat', getRiwayatLimbah);
router.put("/hasilolahan/:riwayat_id", upload.single("gambar_olahan"), edithasilolahan);
router.get("/jumlaholahan", getJumlahOlahan);

export default router;
