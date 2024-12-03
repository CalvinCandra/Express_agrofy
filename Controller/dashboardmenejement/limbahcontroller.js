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
    const md5Hash = crypto
      .createHash("md5")
      .update(file.originalname)
      .digest("hex");
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

// Controller: Tambah Limbah
const tambahLimbah = [
  async (req, res) => {
    const uploadSingle = upload.single("gambar");

    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          msg: "Gagal mengunggah file",
          error: err.message,
        });
      }

      const { nama_limbah, deskripsi } = req.body;
      const gambar = req.file ? req.file.filename : null; // Nama file MD5
      const timestamp = new Date();

      try {
        const email = req.user.email; // Ambil email dari JWT payload

        // Cari user_id berdasarkan email
        const userResult = await query("SELECT id FROM user WHERE email = ?", [
          email,
        ]);

        // Jika tidak ditemukan user dengan email tersebut
        if (userResult.length === 0) {
          return res.status(404).json({
            msg: "User tidak ditemukan",
          });
        }

        const user_id = userResult[0].id; // Ambil user_id berdasarkan email

        // Query untuk menambahkan data limbah ke database
        await query(
          `INSERT INTO limbah (nama_limbah, deskripsi, gambar, user_id, created_at, updated_at) VALUES (?,?,?,?,?,?)`,
          [nama_limbah, deskripsi, gambar, user_id, timestamp, timestamp]
        );

        return res.status(200).json({
          msg: "Limbah berhasil ditambahkan",
          data: {
            nama_limbah,
            deskripsi,
            gambar,
            user_id,
          },
        });
      } catch (error) {
        return res.status(400).json({
          msg: "Gagal menambahkan limbah",
          error,
        });
      }
    });
  },
];

// Controller: Ambil Semua Limbah
const getAllLimbah = [
  passport.authenticate("internal-rule", { session: false }), // Middleware Passport
  async (req, res) => {
    try {
      const email = req.user.email; // Ambil email dari JWT payload

      // Cari user_id berdasarkan email
      const userResult = await query("SELECT id FROM user WHERE email = ?", [
        email,
      ]);

      // Jika tidak ditemukan user dengan email tersebut
      if (userResult.length === 0) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      const user_id = userResult[0].id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const offset = (page - 1) * limit;

      // Ambil data limbah berdasarkan user_id
      const limbah = await query(
        "SELECT id, nama_limbah, deskripsi, gambar FROM limbah WHERE user_id = ? LIMIT ? OFFSET ?",
        [user_id, limit, offset]
      );

      // Hitung jumlah total data artikel
      const totalResults = await query(
        `SELECT COUNT(*) AS total FROM limbah
        WHERE user_id = ?`,
        [user_id]
      );
      const totalData = totalResults[0].total;
      const totalPages = Math.ceil(totalData / limit);

      return res.status(200).json({
        msg: "Berhasil mengambil data limbah",
        data: limbah,
        pagination: {
          totalData,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      });
    } catch (error) {
      return res.status(400).json({
        msg: "Gagal mengambil data limbah",
        error,
      });
    }
  },
];

// Controller: Hapus Limbah
const hapusLimbah = [
  passport.authenticate("internal-rule", { session: false }), // Middleware Passport
  async (req, res) => {
    const { id } = req.params;

    try {
      const email = req.user.email; // Ambil email dari JWT payload

      // Cari user_id berdasarkan email
      const userResult = await query("SELECT id FROM user WHERE email = ?", [
        email,
      ]);

      // Jika tidak ditemukan user dengan email tersebut
      if (userResult.length === 0) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      const user_id = userResult[0].id;

      // Pastikan limbah yang akan dihapus adalah milik user yang sedang login
      const result = await query(
        "DELETE FROM limbah WHERE id = ? AND user_id = ?",
        [id, user_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          msg: "Limbah tidak ditemukan atau Anda tidak memiliki akses",
        });
      }

      return res.status(200).json({
        msg: "Limbah berhasil dihapus",
      });
    } catch (error) {
      return res.status(400).json({
        msg: "Gagal menghapus limbah",
        error,
      });
    }
  },
];

// Controller: Edit Limbah
const editLimbah = [
  passport.authenticate("internal-rule", { session: false }), // Middleware Passport
  async (req, res) => {
    const { id } = req.params; // ID limbah dari parameter URL
    const { nama_limbah, deskripsi } = req.body; // Data yang dikirim dari form
    console.log("File:", req.file); // Log untuk memastikan file diterima
    const gambar = req.file ? req.file.filename : null; // Nama file MD5 (opsional)
    const updated_at = new Date();

    try {
      const email = req.user.email; // Ambil email dari JWT payload

      // Cari user_id berdasarkan email
      const userResult = await query("SELECT id FROM user WHERE email = ?", [
        email,
      ]);

      // Jika tidak ditemukan user dengan email tersebut
      if (userResult.length === 0) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      const user_id = userResult[0].id;

      // Ambil data limbah yang ada untuk memastikan tidak ada data yang dihapus secara tidak sengaja
      const limbahResult = await query(
        "SELECT * FROM limbah WHERE id = ? AND user_id = ?",
        [id, user_id]
      );

      // Jika limbah tidak ditemukan
      if (limbahResult.length === 0) {
        return res.status(404).json({
          msg: "Limbah tidak ditemukan atau Anda tidak memiliki akses",
        });
      }

      const existingLimbah = limbahResult[0];

      // Gunakan data lama jika input baru kosong atau tidak ada
      const finalNamaLimbah = nama_limbah?.trim()
        ? nama_limbah
        : existingLimbah.nama_limbah;
      const finalDeskripsi = deskripsi?.trim()
        ? deskripsi
        : existingLimbah.deskripsi;

      // Jika gambar tidak ada (undefined atau null), gunakan gambar lama
      const finalGambar = gambar || existingLimbah.gambar;

      // Lakukan update data
      const updateQuery = `
        UPDATE limbah
        SET nama_limbah = ?, deskripsi = ?, gambar = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `;
      const result = await query(updateQuery, [
        finalNamaLimbah,
        finalDeskripsi,
        finalGambar,
        updated_at,
        id,
        user_id,
      ]);

      return res.status(200).json({
        msg: "Limbah berhasil diperbarui",
        data: {
          id,
          nama_limbah: finalNamaLimbah,
          deskripsi: finalDeskripsi,
          gambar: finalGambar,
          user_id,
        },
      });
    } catch (error) {
      return res.status(400).json({
        msg: "Gagal memperbarui limbah",
        error,
      });
    }
  },
];

export {
  tambahLimbah,
  getAllLimbah,
  hapusLimbah,
  editLimbah,
  storage,
  fileFilter,
};
