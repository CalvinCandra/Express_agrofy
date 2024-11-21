import { query } from "../../database/database.js";

// Get data video dengan pagination
const getKomunitas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query untuk mendapatkan data artikel dengan pagination
    const results = await query(
      `
      SELECT komunitas.*, user.nama_lengkap, user.foto
      FROM komunitas
      INNER JOIN user ON komunitas.user_id = user.id
      ORDER BY komunitas.id DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Hitung jumlah total data artikel
    const totalResults = await query(`SELECT COUNT(*) AS total FROM komunitas`);
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

// Get balasana berdasarkan id dari komunitas
const getKomunitasBalasan = async (req, res) => {
  try {
    const komunitasId = req.params.id;
    const result = await query(
      `
      SELECT balasan.*, user.nama_lengkap, komunitas.* 
      FROM balasan
      INNER JOIN user ON balasan.user_id = user.id
      INNER JOIN komunitas ON balasan.komunitas_id = komunitas.id
      WHERE balasan.komunitas_id = ?
      ORDER BY komunitas.id DESC`,
      [komunitasId]
    );

    if (result.length === 0) {
      return res.status(200).json({ msg: "Balasan Belum Ada" });
    } else {
      return res.status(200).json({ msg: "Berhasil", data: result });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

// Menambahkan komunitas baru
const tambahKomunitas = async (req, res) => {
  const { caption, email } = req.body;

  try {
    // Cari user berdasarkan email
    const users = await query("SELECT * FROM user WHERE email = ?", [email]);
    if (users.length === 0) {
      throw new Error("User tidak ditemukan");
    }
    const user_id = users[0].id;

    const gambar = req.file ? req.file.filename : null;

    // Set timestamp untuk created_at dan updated_at
    const timestamp = new Date();

    // Simpan artikel baru
    await query(
      `
          INSERT INTO komunitas (user_id, caption, gambar, disukai, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, caption, gambar, null, timestamp, timestamp]
    );

    return res.status(200).json({
      msg: "Video berhasil ditambahkan",
      data: {
        caption,
        user_id,
        gambar,
        timestamp,
        timestamp,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

// Menambahkan balasan baru
const tambahBalasan = async (req, res) => {
  const { balasan, email } = req.body;
  const komunitasId = req.params.id;

  try {
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
          INSERT INTO balasan (user_id, balasan, komunitas_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)`,
      [user_id, balasan, komunitasId, timestamp, timestamp]
    );

    return res.status(200).json({
      msg: "Balasan berhasil ditambahkan",
      data: {
        user_id,
        balasan,
        komunitasId,
        timestamp,
        timestamp,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

export { getKomunitas, getKomunitasBalasan, tambahKomunitas, tambahBalasan };
