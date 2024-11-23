import express from "express";
import { getAllRiwayat } from "../../Controller/dashboardmenejement/riwayatcontroller.js";

const router = express.Router();
router.get("/riwayat", getAllRiwayat);

export default router;
