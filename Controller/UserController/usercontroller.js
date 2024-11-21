import { query } from "../../database/database.js";

// get user
const getUserAdmin = async (req, res) => {
  try {
    // Ambil parameter 'page' dan 'limit' dari query string
    const page = parseInt(req.query.page) || 1; // Default halaman 1
    const limit = parseInt(req.query.limit) || 10; // Default limit 10 data per halaman

    // Hitung OFFSET berdasarkan halaman
    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data admin dengan pagination
    const results = await query(
      `
      SELECT * FROM user WHERE role='admin' ORDER BY user.id DESC LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    // Hitung jumlah total data admin
    const totalResults = await query(
      `SELECT COUNT(*) AS total FROM user WHERE role='admin'`
    );
    const totalData = totalResults[0].total;

    // Hitung jumlah halaman
    const totalPages = Math.ceil(totalData / limit);

    return res.status(200).json({
      msg: "Berhasil",
      data: results, // Data pada halaman saat ini
      pagination: {
        totalData, // Total data admin
        totalPages, // Total halaman
        currentPage: page, // Halaman saat ini
        perPage: limit, // Jumlah data per halaman
      },
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Gagal mendapatkan data",
      error: error.message,
    });
  }
};

// update user
const updateAdmin = async (req, res) => {
  // get data
  const { email, nama_lengkap } = req.body;
  const { id } = req.params;

  // Pengecekan untuk setiap field
  if (!nama_lengkap) {
    return res.status(400).json({ msg: "Nama Lengkap wajib diisi" });
  }
  if (!email) {
    return res.status(400).json({ msg: "Email wajib diisi" });
  }

  // set data timestamp
  const timestamp = new Date();

  try {
    await query(
      `UPDATE user SET email = ?, nama_lengkap = ?, updated_at = ? WHERE id=?`,
      [email, nama_lengkap, timestamp, id]
    );
    return res.status(200).json({
      msg: "Berhasil update",
      data: {
        ...req.body,
      },
    });
  } catch (error) {
    return res.status(400).json({
      msg: "gagal update",
      error,
    });
  }
};

// delete user
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  // Pengecekan untuk setiap field
  if (!id) {
    return res.status(400).json({ msg: "Id tidak ada" });
  }

  try {
    await query(`DELETE FROM user WHERE id = ?`, [id]);
    return res.status(200).json({ msg: "Berhasil di hapus" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal di hapus" });
  }
};

export { getUserAdmin, updateAdmin, deleteAdmin };
