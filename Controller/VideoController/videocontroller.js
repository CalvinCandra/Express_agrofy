import { query } from "../../database/database.js";
import path from "path";
import fs from "fs";
import { deleteUploadVideo } from "../../utils/deleteUploadVideo.js";

// Get data video dengan pagination
const getVideo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || ""; // Parameter search, default kosong jika tidak ada

    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data video dengan pagination
    const results = await query(
      `
      SELECT video.*, user.nama_lengkap, kategori.nama_kategori
      FROM video
      INNER JOIN user ON video.user_id = user.id
      INNER JOIN kategori ON video.kategori_id = kategori.id
      WHERE video.judul_video LIKE ? OR kategori.nama_kategori LIKE ?
      ORDER BY video.id DESC
      LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, limit, offset]
    );

    // Hitung jumlah total data video
    const totalResults = await query(
      `SELECT COUNT(*) AS total FROM video INNER JOIN user ON video.user_id = user.id
      INNER JOIN kategori ON video.kategori_id = kategori.id
      WHERE video.judul_video LIKE ? OR kategori.nama_kategori LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );

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
  try {
    const { judul, deskripsi, kategori_id } = req.body;
    // variabel untuk video dan thumbnail
    const videoName = req.files["video"]
      ? req.files["video"][0].filename
      : null;
    const thumbnail = req.files["thumbnail"]
      ? req.files["thumbnail"][0].filename
      : null;

    // cek panjang judul
    if (judul.length > 100) {
      deleteUploadVideo(thumbnail, videoName);
      return res.status(400).json({ msg: "Judul terlalu panjang" });
    }

    // get email dari token
    const email = req.user.email;

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
          INSERT INTO video (judul_video, deskripsi, video, thumbnail, user_id, kategori_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judul,
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
        judul,
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
};

// update artikel
const updateVideo = async (req, res) => {
  const { id } = req.params; // ID artikel
  const { judul, deskripsi, kategori_id } = req.body;
  const newVideo = req.files["video"] ? req.files["video"][0].filename : null;
  const newThumbnail = req.files["thumbnail"]
    ? req.files["thumbnail"][0].filename
    : null;

  // cek panjang judul
  if (judul.length > 100) {
    deleteUploadVideo(newThumbnail, newVideo);
    return res.status(400).json({ msg: "Judul terlalu panjang" });
  }

  // get email dari token
  const email = req.user.email;

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
      const oldThumbnailPath = path.resolve("upload/video/thum/", oldThumbnail);

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
        judul,
        deskripsi,
        newVideo ? newVideo : oldVideo, // Gunakan file lama jika tidak ada file baru
        newThumbnail ? newThumbnail : oldThumbnail, // Gunakan file lama jika tidak ada file baru
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

    if (gambarLama || videoLama) {
      deleteUploadVideo(gambarLama, videoLama);
    }

    await query(`DELETE FROM video WHERE id = ?`, [id]);
    return res.status(200).json({ msg: "Berhasil di hapus" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal di hapus", error });
  }
};

export { getVideo, getVideoDetail, tambahVideo, updateVideo, deleteVideo };
