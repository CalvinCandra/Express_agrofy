import { query } from "../../database/database.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Konfigurasi penyimpanan file
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const folder =
//       file.fieldname === "ckeditor" ? "upload/ckeditor/" : "upload/artikel/";
//     if (!fs.existsSync(folder)) {
//       fs.mkdirSync(folder, { recursive: true });
//     }
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "upload/artikel/";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  },
});

// Validasi tipe file (gambar saja)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar dengan format .jpg, .jpeg, atau .png"));
    }
  },
});

// Get data artikel dengan pagination
const getArtikel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data artikel dengan pagination
    const results = await query(
      `
      SELECT artikel.*, user.nama_lengkap, kategori.nama_kategori
      FROM artikel
      INNER JOIN user ON artikel.user_id = user.id
      INNER JOIN kategori ON artikel.kategori_id = kategori.id
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Hitung jumlah total data artikel
    const totalResults = await query(`SELECT COUNT(*) AS total FROM artikel`);
    const totalData = totalResults[0].total;
    const totalPages = Math.ceil(totalData / limit);

    return res.status(200).json({
      msg: "Berhasil",
      data: results,
      pagination: {
        totalData,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Gagal mendapatkan data",
      error: error.message,
    });
  }
};

// Get artikel detail berdasarkan ID
const getArtikelDetail = async (req, res) => {
  try {
    const artikelId = req.params.id;
    const result = await query(
      `
      SELECT artikel.judul_artikel, artikel.deskripsi, artikel.thumbnail, artikel.created_at, artikel.updated_at, 
             user.nama_lengkap, kategori.nama_kategori
      FROM artikel
      INNER JOIN user ON artikel.user_id = user.id
      INNER JOIN kategori ON artikel.kategori_id = kategori.id
      WHERE artikel.id = ?`,
      [artikelId]
    );

    if (result.length === 0) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    return res.status(200).json({ msg: "Berhasil", data: result[0] });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

// Menambahkan artikel baru
const tambahArtikel = async (req, res) => {
  const uploadMiddleware = upload.single("thumbnail");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: "Upload gagal", error: err.message });
    }

    try {
      const { judul_artikel, deskripsi, email, kategori_id } = req.body;

      // Pengecekan untuk setiap field
      if (!judul_artikel) {
        return res.status(400).json({ msg: "Judul artikel wajib diisi" });
      }
      if (!deskripsi) {
        return res.status(400).json({ msg: "Deskripsi artikel wajib diisi" });
      }
      if (!email) {
        return res.status(400).json({ msg: "Email wajib diisi" });
      }
      if (!kategori_id) {
        return res.status(400).json({ msg: "Kategori ID wajib diisi" });
      }

      const thumbnail = req.file ? req.file.filename : null;

      // Cari user berdasarkan email
      const users = await query("SELECT * FROM user WHERE email = ?", [email]);

      if (users.length === 0) {
        return res.status(400).json({ msg: "User tidak ditemukan" });
      }

      const user_id = users[0].id;

      // Set timestamp untuk created_at dan updated_at
      const timestamp = new Date();

      // Simpan artikel baru
      await query(
        `
        INSERT INTO artikel (judul_artikel, deskripsi, thumbnail, user_id, kategori_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          judul_artikel,
          deskripsi,
          thumbnail,
          user_id,
          kategori_id,
          timestamp,
          timestamp,
        ]
      );

      return res.status(200).json({
        msg: "Artikel berhasil ditambahkan",
        data: { judul_artikel, deskripsi, thumbnail, user_id, kategori_id },
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Internal Server Error",
        error: error.message,
      });
    }
  });
};

// update artikel
const updateArtikel = async (req, res) => {
  const uploadMiddleware = upload.single("thumbnail");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }

    const { id } = req.params; // ID artikel
    const { judul_artikel, deskripsi, email, kategori_id } = req.body;
    const newThumbnail = req.file ? req.file.filename : null;

    // Pengecekan untuk setiap field
    if (!judul_artikel) {
      return res.status(400).json({ msg: "Judul artikel wajib diisi" });
    }
    if (!deskripsi) {
      return res.status(400).json({ msg: "Deskripsi artikel wajib diisi" });
    }
    if (!email) {
      return res.status(400).json({ msg: "Email wajib diisi" });
    }
    if (!kategori_id) {
      return res.status(400).json({ msg: "Kategori ID wajib diisi" });
    }

    try {
      // Ambil artikel lama
      const artikelLama = await query(`SELECT * FROM artikel WHERE id = ?`, [
        id,
      ]);

      if (artikelLama.length === 0) {
        return res.status(404).json({ msg: "Artikel tidak ditemukan" });
      }

      const oldThumbnail = artikelLama[0].thumbnail;

      // Jika ada gambar baru, hapus gambar lama
      if (newThumbnail && oldThumbnail) {
        const oldThumbnailPath = path.resolve("upload/artikel/", oldThumbnail);

        if (fs.existsSync(oldThumbnailPath)) {
          await fs.promises.unlink(oldThumbnailPath); // Hapus file lama
        }
      }

      // Cari user berdasarkan email
      const users = await query("SELECT * FROM user WHERE email = ?", [email]);
      if (users.length === 0) {
        return res.status(400).json({ msg: "User tidak ditemukan" });
      }
      const user_id = users[0].id;

      // Set timestamp untuk updated_at
      const timestamp = new Date();

      // Update artikel di database
      const result = await query(
        `
        UPDATE artikel 
        SET judul_artikel = ?, deskripsi = ?, thumbnail = ?, user_id = ?, kategori_id = ?, updated_at = ?
        WHERE id = ?`,
        [
          judul_artikel,
          deskripsi,
          newThumbnail || oldThumbnail, // Gunakan file lama jika tidak ada file baru
          user_id,
          kategori_id,
          timestamp,
          id,
        ]
      );

      return res.status(200).json({
        msg: "Berhasil update",
        data: {
          ...result,
        },
      });
    } catch (error) {
      console.error(error); // Debugging
      return res.status(500).json({
        msg: "Gagal Diupdate",
        error: error.message,
      });
    }
  });
};

// delete artikel
const deleteArtikel = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil artikel lama untuk mendapatkan nama file sebelumnya
    const gambar = await query(`SELECT * FROM artikel WHERE id = ?`, [id]);

    if (gambar.length === 0) {
      return res.status(404).json({ msg: "Artikel tidak ditemukan" });
    }

    // Path gambar lama
    const thumbnail = gambar[0].thumbnail;
    if (thumbnail) {
      // Cek apakah thumbnail tidak null
      const hapusgambar = path.resolve("upload/artikel", thumbnail);

      // Hapus file gambar jika ada
      if (fs.existsSync(hapusgambar)) {
        await fs.promises.unlink(hapusgambar);
      }
    }
    await query(`DELETE FROM artikel WHERE id = ?`, [id]);
    return res.status(200).json({ msg: "Berhasil di hapus" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal di hapus" });
  }
};

export {
  getArtikel,
  getArtikelDetail,
  tambahArtikel,
  updateArtikel,
  deleteArtikel,
};
