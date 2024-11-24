import express from "express";
import {createNotification, getNotifications } from "../../Controller/dashboardmenejement/notificationcontroller.js";

const router = express.Router();

// Route to create notifications
router.post('/notifikasi', createNotification);

router.get('/notifikasi', getNotifications);

export default router;