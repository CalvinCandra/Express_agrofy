import { query } from "../../database/database.js";

// Function to create notification if tgl_selesai matches the current date
export const createNotification = async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Select records from catatan_pengelolahan where tgl_selesai is today
    const result = await query(`
      SELECT cp.id 
      FROM catatan_pengelolahan cp
      WHERE cp.tgl_selesai = ?
    `, [today]);

    // If there are matching records, create notifications
    if (result.length > 0) {
      for (const record of result) {
        const notification = await query(`
          INSERT INTO notifikasi (catatan_id, tgl_notif, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [record.id, today]);
      }
      res.status(200).json({ message: "Notifications created successfully." });
    } else {
      res.status(200).json({ message: "No records found for today." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating notifications." });
  }
};

export const getNotifications = async (req, res) => {
    try {
      // Mendapatkan data notifikasi dari beberapa tabel
      const result = await query(`
        SELECT cp.id AS catatan_id, l.nama_limbah, p.target_olahan, l.gambar, cp.tgl_selesai 
        FROM catatan_pengelolahan cp
        JOIN limbah l ON l.id = cp.limbah_id
        JOIN pengolahan p ON p.id = cp.pengolahan_id
        WHERE cp.tgl_selesai = CURDATE()
      `);
  
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


