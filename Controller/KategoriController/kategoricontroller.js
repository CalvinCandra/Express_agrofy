import { query } from "../../database/database.js";

// get data
const getKategori = async (req, res) => {
  try {
    // Ambil parameter 'page' dan 'limit' dari query string
    const page = parseInt(req.query.page) || 1; // Default halaman 1
    const limit = parseInt(req.query.limit) || 10; // Default limit 10 data per halaman
    const search = req.query.search || ""; // Parameter search, default kosong jika tidak ada

    // Hitung OFFSET berdasarkan halaman
    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data dengan pagination
    const results = await query(
      `
        SELECT kategori.*, user.nama_lengkap
        FROM kategori
        INNER JOIN user ON kategori.user_id = user.id
        WHERE kategori.nama_kategori LIKE ?
        ORDER BY kategori.id DESC LIMIT ? OFFSET ?
      `,
      [`%${search}%`, limit, offset]
    );

    // Hitung jumlah total data
    const totalResults = await query(
      `
        SELECT COUNT(*) AS total 
        FROM kategori
        WHERE kategori.nama_kategori LIKE ?
      `,
      [`%${search}%`]
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

// tambah
const tambahKategori = async (req, res, next) => {
  const { nama_kategori } = req.body;

  // cek data nama_kategori tidak melebihi panjang colom
  if (nama_kategori.length > 50) {
    return res.status(400).json({ msg: "Nama Kategori terlalu panjang" });
  }

  // get email dari token
  const email = req.user.email;

  // Cari user berdasarkan email
  const users = await query("SELECT * FROM user WHERE email = ?", [email]);
  if (users.length === 0) {
    return res.status(400).json({ msg: "User tidak ditemukan" });
  }
  const user_id = users[0].id;

  //set timestamp otomatis
  const timestamp = new Date();

  try {
    await query(
      `INSERT INTO kategori (nama_kategori, user_id, created_at, updated_at) VALUES (?,?,?,?)`,
      [nama_kategori, user_id, timestamp, timestamp]
    );
    next();
    return res.status(200).json({
      msg: "Berhasil tambah",
      data: {
        ...req.body,
      },
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Gagal tambah",
      error,
    });
  }
};

// update
const updateKategori = async (req, res) => {
  // get data
  const { nama_kategori } = req.body;
  const { id } = req.params;

  // cek panjang judul
  if (nama_kategori > 100) {
    return res.status(400).json({ msg: "Nama Kategori terlalu panjang" });
  }

  // get email dari token
  const email = req.user.email;

  const users = await query("SELECT * FROM user WHERE email = ?", [email]);
  if (users.length === 0) {
    return res.status(400).json({ msg: "User tidak ditemukan" });
  }
  const user_id = users[0].id;

  // set data timestamp
  const timestamp = new Date();

  try {
    await query(
      `UPDATE kategori SET nama_kategori = ?, user_id = ?, updated_at = ? WHERE id=?`,
      [nama_kategori, user_id, timestamp, id]
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

// delete
const deleteKategori = async (req, res) => {
  const { id } = req.params;
  try {
    await query(`DELETE FROM kategori WHERE id = ?`, [id]);
    return res.status(200).json({ msg: "Berhasil di hapus" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal di hapus" });
  }
};

export { getKategori, tambahKategori, updateKategori, deleteKategori };
