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
      SELECT cp.id, cp.pengolahan_id 
      FROM catatan_pengelolahan cp
      WHERE DATE(cp.tgl_selesai) = ?
    `, [today]);
    

    // Jika ada data yang cocok, buat notifikasi
    if (result.length > 0) {
      for (const record of result) {
        await query(`
          INSERT INTO notifikasi (catatan_id, tgl_notif, created_at, updated_at, pengelolaan_id)
          VALUES (?, ?, NOW(), NOW(), ?)
        `, [record.id, today, record.pengolahan_id]);
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

    // Ambil data notifikasi berdasarkan user_id
    const result = await query(`
      SELECT 
        n.id AS notifikasi_id,
        n.catatan_id,
        n.tgl_notif,
        n.pengelolaan_id,
        l.nama_limbah,
        l.gambar
      FROM notifikasi n
      LEFT JOIN pengelolaan_limbah p ON n.pengelolaan_id = p.id
      LEFT JOIN limbah l ON p.limbah_id = l.id
      WHERE l.user_id = ?
      ORDER BY n.tgl_notif DESC;
    `, [user_id]);

    // Jika ada notifikasi
    if (result.length > 0) {
      res.status(200).json({ notifications: result });
    } else {
      res.status(200).json({ message: "No notifications found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching notifications." });
  }
};

export const deleteAllNotifications = async (req, res) => {
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

    // Hapus notifikasi berdasarkan user_id
    await query(`
      DELETE n
      FROM notifikasi n
      JOIN catatan_pengelolahan cp ON n.catatan_id = cp.id
      JOIN pengelolaan_limbah p ON cp.pengolahan_id = p.id
      JOIN limbah l ON p.limbah_id = l.id
      WHERE l.user_id = ?
    `, [user_id]);

    res.status(200).json({ message: "Semua notifikasi berhasil dihapus untuk pengguna ini." });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus notifikasi." });
  }
};




