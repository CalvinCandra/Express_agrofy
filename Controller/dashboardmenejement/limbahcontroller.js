import { query } from "../../database/database.js";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from 'url';


// Mendefinisikan __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Konfigurasi multer untuk menyimpan file

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../img/upload"));
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

// Controller: Tambah Limbah
const tambahLimbah = async (req, res) => {
  const uploadSingle = upload.single("gambar");

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        msg: "Gagal mengunggah file",
        error: err.message,
      });
    }

    const { nama_limbah, deskripsi, user_id } = req.body;
    const gambar = req.file ? req.file.filename : null; // Nama file MD5
    const timestamp = new Date();

    try {
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
};



// Controller: Ambil Semua Limbah
const getAllLimbah = async (req, res) => {
  try {
    const limbah = await query("SELECT id, nama_limbah, deskripsi, gambar FROM limbah");
    return res.status(200).json({
      msg: "Berhasil mengambil data limbah",
      data: limbah,
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Gagal mengambil data limbah",
      error,
    });
  }
};

 
// Controller: Hapus Limbah
const hapusLimbah = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("DELETE FROM limbah WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        msg: "Limbah tidak ditemukan",
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
};


export { tambahLimbah, getAllLimbah, hapusLimbah };
