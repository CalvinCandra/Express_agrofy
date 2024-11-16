import { query } from "../../database/database.js";

// Controller: Tambah Limbah
const tambahLimbah = async (req, res) => {
  const { nama_limbah, deskripsi, gambar = null, user_id } = req.body;

  // Set timestamp otomatis
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
};

// Controller: Ambil Semua Limbah
const getAllLimbah = async (req, res) => {
  try {
    const limbah = await query("SELECT * FROM limbah");
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
