import { query } from "../../database/database.js";
import cron from 'node-cron';
import express from 'express';

const app = express();
// Function to create notification if tgl_selesai matches the current date
export const createNotification = async () => {
  try {
    // Dapatkan tanggal hari ini
    const today = new Date().toISOString().split('T')[0];

    // Ambil catatan dengan tgl_selesai = hari ini
    const result = await query(`
      SELECT cp.id 
      FROM catatan_pengelolahan cp
      WHERE cp.tgl_selesai = ?
    `, [today]);

    // Jika ada data yang cocok, buat notifikasi
    if (result.length > 0) {
      for (const record of result) {
        await query(`
          INSERT INTO notifikasi (catatan_id, tgl_notif, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [record.id, today]);
      }
      console.log("Notifications created successfully.");
    } else {
      console.log("No records found for today.");
    }
  } catch (error) {
    console.error("Error while creating notifications:", error);
  }
};

// Menjadwalkan cron job untuk dijalankan setiap tengah malam
cron.schedule('0 0 * * *', async () => {
  console.log("Running scheduled task: createNotification");
  await createNotification();
});

export const getNotifications = async (req, res) => {
  try {
    const email = req.user.email; // Ambil email dari JWT payload
    
    // Cari user_id berdasarkan email
    const userResult = await query("SELECT id FROM user WHERE email = ?", [email]);

    // Jika tidak ditemukan user dengan email tersebut
    if (userResult.length === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
      });
    }

    const user_id = userResult[0].id;

    // Ambil catatan yang sesuai dengan user_id
    const result = await query(`
      SELECT cp.id AS catatan_id, 
             l.nama_limbah, 
             p.target_olahan, 
             l.gambar, 
             cp.tgl_selesai 
      FROM catatan_pengelolahan cp
      JOIN pengelolaan_limbah p ON p.id = cp.pengolahan_id
      JOIN limbah l ON l.id = p.limbah_id
      WHERE cp.tgl_selesai = CURDATE()
      AND l.user_id = ?;
    `, [user_id]);

    // Jika ada notifikasi
    if (result.length > 0) {
      res.status(200).json({ notifications: result });
    } else {
      res.status(200).json({ message: "No notifications found for today." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching notifications." });
  }
};



