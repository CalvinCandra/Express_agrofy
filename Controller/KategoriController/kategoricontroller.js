import { query } from "../../database/database.js";

// get data
const getKategori = async (req, res) => {
  try {
    // Ambil parameter 'page' dan 'limit' dari query string
    const page = parseInt(req.query.page) || 1; // Default halaman 1
    const limit = parseInt(req.query.limit) || 10; // Default limit 10 data per halaman

    // Hitung OFFSET berdasarkan halaman
    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data dengan pagination
    const results = await query(
      `
        SELECT * FROM kategori LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    // Hitung jumlah total data
    const totalResults = await query(`SELECT COUNT(*) AS total FROM kategori`);
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
const tambahKategori = async (req, res) => {
  const { nama_kategori } = req.body;

  //set timestamp otomatis
  const timestamp = new Date();

  try {
    await query(
      `INSERT INTO kategori (nama_kategori, created_at, updated_at) VALUES (?,?,?)`,
      [nama_kategori, timestamp, timestamp]
    );
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

  // set data timestamp
  const timestamp = new Date();

  try {
    await query(
      `UPDATE kategori SET nama_kategori = ?, updated_at = ? WHERE id=?`,
      [nama_kategori, timestamp, id]
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
