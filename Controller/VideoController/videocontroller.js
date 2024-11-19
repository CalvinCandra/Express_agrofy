import { query } from "../../database/database.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// set untuk tempat upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, "upload/video/video");
    } else if (file.mimetype.startsWith("image/")) {
      cb(null, "upload/video/thum");
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

// Validasi tipe file (video saja)
const upload = multer({
  storage,
  limits: {
    fileSize: (req, file) => {
      if (file.mimetype.startsWith("video/")) {
        return 500 * 1024 * 1024; // 10 MB
      } else if (file.mimetype.startsWith("image/")) {
        return 5 * 1024 * 1024; // 5 MB
      }
    },
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      video: /mp4|mkv/,
      thumbnail: /jpg|jpeg|png/,
    };
    const isAllowed = allowedTypes[file.fieldname].test(
      path.extname(file.originalname).toLowerCase()
    );
    cb(null, isAllowed);
  },
});

// Get data video dengan pagination
const getVideo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data artikel dengan pagination
    const results = await query(
      `
      SELECT video.*, user.nama_lengkap, kategori.nama_kategori
      FROM video
      INNER JOIN user ON video.user_id = user.id
      INNER JOIN kategori ON video.kategori_id = kategori.id
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Hitung jumlah total data artikel
    const totalResults = await query(`SELECT COUNT(*) AS total FROM video`);
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

// Get video detail berdasarkan ID
const getVideoDetail = async (req, res) => {
  try {
    const videolId = req.params.id;
    const result = await query(
      `
      SELECT video.*, user.nama_lengkap, kategori.nama_kategori
      FROM video
      INNER JOIN user ON video.user_id = user.id
      INNER JOIN kategori ON video.kategori_id = kategori.id
      WHERE video.id = ?`,
      [videolId]
    );

    if (result.length === 0) {
      return res.status(404).json({ msg: "Video tidak ditemukan" });
    }

    return res.status(200).json({ msg: "Berhasil", data: result[0] });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

// Menambahkan video baru
const tambahVideo = async (req, res) => {
  const uploadFields = upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]);

  uploadFields(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: "Upload Gagal", error: err.message });
    }

    try {
      const { judul_video, deskripsi, email, kategori_id } = req.body;

      // Pengecekan untuk setiap field
      if (!judul_video) {
        return res.status(400).json({ msg: "Judul Video wajib diisi" });
      }
      if (!deskripsi) {
        return res.status(400).json({ msg: "Deskripsi Video wajib diisi" });
      }
      if (!email) {
        return res.status(400).json({ msg: "Email wajib diisi" });
      }
      if (!kategori_id) {
        return res.status(400).json({ msg: "Kategori ID wajib diisi" });
      }

      // Cari user berdasarkan email
      const users = await query("SELECT * FROM user WHERE email = ?", [email]);
      if (users.length === 0) {
        return res.status(400).json({ msg: "User tidak ditemukan" });
      }
      const user_id = users[0].id;

      // variabel untuk video dan thumbnail
      const videoName = req.files["video"]
        ? req.files["video"][0].filename
        : null;
      const thumbnail = req.files["thumbnail"]
        ? req.files["thumbnail"][0].filename
        : null;

      // Set timestamp untuk created_at dan updated_at
      const timestamp = new Date();

      // Simpan artikel baru
      await query(
        `
            INSERT INTO video (judul_video, deskripsi, video, thumbnail, user_id, kategori_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          judul_video,
          deskripsi,
          videoName,
          thumbnail,
          user_id,
          kategori_id,
          timestamp,
          timestamp,
        ]
      );

      return res.status(200).json({
        msg: "Video berhasil ditambahkan",
        data: {
          judul_video,
          deskripsi,
          videoName,
          thumbnail,
          user_id,
          kategori_id,
        },
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
const updateVideo = async (req, res) => {
  const uploadFields = upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]);

  uploadFields(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }

    const { id } = req.params; // ID artikel
    const { judul_video, deskripsi, email, kategori_id } = req.body;
    const newVideo = req.files["video"] ? req.files["video"][0].filename : null;
    const newThumbnail = req.files["thumbnail"]
      ? req.files["thumbnail"][0].filename
      : null;

    // Pengecekan untuk setiap field
    if (!judul_video) {
      return res.status(400).json({ msg: "Judul Video wajib diisi" });
    }
    if (!deskripsi) {
      return res.status(400).json({ msg: "Deskripsi Video wajib diisi" });
    }
    if (!email) {
      return res.status(400).json({ msg: "Email wajib diisi" });
    }
    if (!kategori_id) {
      return res.status(400).json({ msg: "Kategori ID wajib diisi" });
    }

    try {
      // Ambil video lama
      const lama = await query(`SELECT * FROM video WHERE id = ?`, [id]);

      if (lama.length === 0) {
        return res.status(400).json({ msg: "Video tidak ditemukan" });
      }

      // ambil thumbnail dan video lama
      const oldVideo = lama[0].video;
      const oldThumbnail = lama[0].thumbnail;

      // Jika ada video  baru, hapus video lama
      if (newVideo && oldVideo) {
        const oldVideoPath = path.resolve("upload/video/video/", oldVideo);

        if (fs.existsSync(oldVideoPath)) {
          await fs.promises.unlink(oldVideoPath); // Hapus file lama
        }
      }

      // Jika ada video  baru, hapus video lama
      if (newThumbnail && oldThumbnail) {
        const oldThumbnailPath = path.resolve(
          "upload/video/thum/",
          oldThumbnail
        );

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
          UPDATE video 
          SET judul_video = ?, deskripsi = ?, video = ?, thumbnail = ?, user_id = ?, kategori_id = ?, updated_at = ?
          WHERE id = ?`,
        [
          judul_video,
          deskripsi,
          newVideo || oldVideo, // Gunakan file lama jika tidak ada file baru
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
const deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil artikel lama untuk mendapatkan nama file sebelumnya
    const video = await query(`SELECT * FROM video WHERE id = ?`, [id]);

    if (video.length === 0) {
      return res.status(404).json({ msg: "Video tidak ditemukan" });
    }

    // Path gambar lama
    const videoLama = video[0].video;
    const gambarLama = video[0].thumbnail;

    if (gambarLama) {
      // Cek apakah thumbnail tidak null
      const hapusgambar = path.resolve("upload/video/thum", gambarLama);

      // Hapus file gambar jika ada
      if (fs.existsSync(hapusgambar)) {
        await fs.promises.unlink(hapusgambar);
      }
    }

    if (videoLama) {
      // Cek apakah video tidak null
      const hapusvideo = path.resolve("upload/video/", videoLama);

      // Hapus file video jika ada
      if (fs.existsSync(hapusvideo)) {
        await fs.promises.unlink(hapusvideo);
      }
    }

    await query(`DELETE FROM video WHERE id = ?`, [id]);
    return res.status(200).json({ msg: "Berhasil di hapus" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Gagal di hapus", error: error.message });
  }
};

export { getVideo, getVideoDetail, tambahVideo, updateVideo, deleteVideo };