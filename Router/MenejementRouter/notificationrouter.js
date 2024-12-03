import express from "express";
import {createNotification, getNotifications, deleteAllNotifications, } from "../../Controller/dashboardmenejement/notificationcontroller.js";

const router = express.Router();

// Route to create notifications
router.post('/notifikasi', createNotification);

router.get('/notifikasi', getNotifications);

router.delete('/notifikasi', deleteAllNotifications);

export default router;