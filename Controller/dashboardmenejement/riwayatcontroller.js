import { query } from "../../database/database.js";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import passport from "../../middleware/passport.js"; // Middleware Passport

// Mendefinisikan __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../upload/menejemen"));
  },
  filename: (req, file, cb) => {
    const md5Hash = crypto.createHash("md5").update(file.originalname).digest("hex");
    cb(null, `${md5Hash}${path.extname(file.originalname)}`);
  },
});

// Filter hanya menerima file dengan format tertentu
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung"), false);
  }
};

// Middleware multer
const upload = multer({ storage, fileFilter });

// Fungsi untuk mendapatkan data riwayat limbah sesuai user
const getRiwayatLimbah = async (req, res) => {
  try {
    const email = req.user.email; // Ambil email dari JWT payload

    // Cari user_id berdasarkan email
    const userResult = await query("SELECT id FROM user WHERE email = ?", [email]);

    // Jika user tidak ditemukan
    if (userResult.length === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
      });
    }

    const user_id = userResult[0].id;

    // Query untuk mengambil data riwayat sesuai dengan user_id, serta data hasil olahan
    const result = await query(`
      SELECT 
        riwayat.id AS riwayat_id,
        riwayat.tgl_selesai,
        pengelolaan_limbah.target_olahan,
        pengelolaan_limbah.tgl_mulai,
        pengelolaan_limbah.tgl_selesai AS tgl_selesai_pengelolaan,
        pengelolaan_limbah.status,
        limbah.nama_limbah,
        limbah.deskripsi AS deskripsi_limbah,
        limbah.gambar AS gambar_limbah,
        user.nama_lengkap AS pengelola,
        hasil_olahan.deskripsi_olahan,
        hasil_olahan.gambar AS gambar_olahan
      FROM 
        riwayat
      JOIN 
        pengelolaan_limbah ON riwayat.pengelolaan_id = pengelolaan_limbah.id
      JOIN 
        limbah ON pengelolaan_limbah.limbah_id = limbah.id
      JOIN 
        user ON limbah.user_id = user.id
      LEFT JOIN 
        hasil_olahan ON riwayat.id = hasil_olahan.riwayat_id
      WHERE 
        limbah.user_id = ?
    `, [user_id]);

    // Kirimkan hasil query
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};

// Fungsi untuk mengedit deskripsi dan gambar hasil olahan
const edithasilolahan = async (req, res) => {
  try {
    
    const { riwayat_id } = req.params; // Ambil riwayat_id dari parameter URL
    const { deskripsi_olahan } = req.body; // Ambil deskripsi olahan dari body request
    const gambar_olahan = req.file ? req.file.filename : null; // Ambil nama file gambar jika ada

    // Jika tidak ada deskripsi olahan atau gambar yang diubah
    if (!deskripsi_olahan && !gambar_olahan) {
      return res.status(400).json({
        msg: "Deskripsi olahan atau gambar harus diubah",
      });
    }

    // Update deskripsi olahan dan gambar ke database
    const queryUpdate = `
      UPDATE hasil_olahan
      SET deskripsi_olahan = ?, gambar = ?
      WHERE riwayat_id = ?
    `;

    const result = await query(queryUpdate, [deskripsi_olahan, gambar_olahan, riwayat_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        msg: "Riwayat olahan tidak ditemukan",
      });
    }

    res.json({
      msg: "Deskripsi dan gambar olahan berhasil diperbarui",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};

const getJumlahOlahan = async (req, res) => {
  try {
    const email = req.user.email; // Ambil email dari JWT payload

    // Cari user_id berdasarkan email
    const userResult = await query("SELECT id FROM user WHERE email = ?", [email]);

    if (userResult.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const user_id = userResult[0].id;

    // Hitung jumlah hasil olahan sesuai user_id
    const result = await query(`
      SELECT COUNT(*) AS jumlahOlahan
      FROM hasil_olahan
      WHERE riwayat_id IN (
        SELECT id
        FROM riwayat
        WHERE pengelolaan_id IN (
          SELECT id
          FROM pengelolaan_limbah
          WHERE limbah_id IN (
            SELECT id
            FROM limbah
            WHERE user_id = ?
          )
        )
      )
    `, [user_id]);

    res.json({ jumlahOlahan: result[0].jumlahOlahan });
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};

const getRiwayatolahan = async (req, res) => {
  try {
    const email = req.user.email; // Ambil email dari JWT payload

    // Cari user_id berdasarkan email
    const userResult = await query("SELECT id FROM user WHERE email = ?", [email]);

    // Jika user tidak ditemukan
    if (userResult.length === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
      });
    }

    const user_id = userResult[0].id;

    // Query untuk mengambil data riwayat dengan status selesai
    const result = await query(`
      SELECT 
        riwayat.id AS riwayat_id,
        riwayat.tgl_selesai,
        pengelolaan_limbah.target_olahan,
        pengelolaan_limbah.tgl_mulai,
        pengelolaan_limbah.tgl_selesai AS tgl_selesai_pengelolaan,
        pengelolaan_limbah.status,
        limbah.nama_limbah,
        limbah.deskripsi AS deskripsi_limbah,
        limbah.gambar AS gambar_limbah,
        user.nama_lengkap AS pengelola,
        hasil_olahan.deskripsi_olahan,
        hasil_olahan.gambar AS gambar_olahan
      FROM 
        riwayat
      JOIN 
        pengelolaan_limbah ON riwayat.pengelolaan_id = pengelolaan_limbah.id
      JOIN 
        limbah ON pengelolaan_limbah.limbah_id = limbah.id
      JOIN 
        user ON limbah.user_id = user.id
      LEFT JOIN 
        hasil_olahan ON riwayat.id = hasil_olahan.riwayat_id
      WHERE 
        limbah.user_id = ? AND pengelolaan_limbah.status = 'selesai'
    `, [user_id]);

    // Kirimkan hasil query
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};



export{getRiwayatLimbah, edithasilolahan, fileFilter, storage, getJumlahOlahan, getRiwayatolahan}