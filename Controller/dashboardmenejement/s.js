import { query } from "../../database/database.js";

const getUserIdByEmail = async (email) => {
  const result = await query("SELECT id FROM user WHERE email = ?", [email]);
  return result.length > 0 ? result[0].id : null;
};

// Controller: Tambah Pengolahan Limbah
const tambahPengolahanLimbah = async (req, res) => {
  const { limbah_id, target_olahan, tgl_mulai, tgl_selesai, status, catatanPeriode } = req.body;
  const email = req.user.email; // Asumsikan email ada di JWT atau session

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // Menambahkan data ke tabel pengelolaan limbah dengan user_id
    const result = await query(
      `INSERT INTO pengelolaan_limbah (limbah_id, target_olahan, tgl_mulai, tgl_selesai, status) VALUES (?, ?, ?, ?, ?)`,
      [limbah_id, target_olahan, tgl_mulai, tgl_selesai, status]
    );

    const pengolahanId = result.insertId;

    // Menambahkan catatan periode
    if (catatanPeriode && catatanPeriode.length > 0) {
      const values = catatanPeriode.map((catatan) => [
        pengolahanId,
        catatan.tgl_mulai,
        catatan.tgl_selesai,
        catatan.catatan,
      ]);

      await query(
        `INSERT INTO catatan_pengelolahan (pengolahan_id, tgl_mulai, tgl_selesai, catatan) VALUES ?`,
        [values]
      );
    }

    return res.status(200).json({
      msg: "Pengolahan limbah berhasil ditambahkan",
      pengolahan_id: pengolahanId,
    });
  } catch (error) {
    console.error("Error pada tambahPengolahanLimbah:", error.message);
    return res.status(400).json({
      msg: "Gagal menambahkan pengolahan limbah",
      error: error.message,
    });
  }
};

// Controller: Ambil Semua Pengolahan Limbah
const getAllPengolahanLimbah = async (req, res) => {
  const email = req.user.email;

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const pengolahanLimbah = await query(
      `SELECT p.id, l.nama_limbah, p.target_olahan, p.tgl_mulai, p.tgl_selesai, p.status
       FROM pengelolaan_limbah p
       JOIN limbah l ON p.limbah_id = l.id
       WHERE l.user_id = ?`,
      [user_id]
    );

    return res.status(200).json({
      msg: "Berhasil mengambil data pengolahan limbah",
      data: pengolahanLimbah,
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Gagal mengambil data pengolahan limbah",
      error: error.message,
    });
  }
};

// Controller: Hapus Pengolahan Limbah
const hapusPengolahanLimbah = async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // Verifikasi apakah user_id memiliki akses ke pengolahan limbah ini
    const pengolahan = await query(
      `SELECT * FROM pengelolaan_limbah p 
       JOIN limbah l ON p.limbah_id = l.id 
       WHERE p.id = ? AND l.user_id = ?`,
      [id, user_id]
    );

    if (pengolahan.length === 0) {
      return res.status(403).json({ msg: "Anda tidak memiliki akses untuk menghapus pengolahan ini" });
    }

    // Hapus catatan terkait pengelolaan limbah
    await query(`DELETE FROM catatan_pengelolahan WHERE pengolahan_id = ?`, [id]);

    // Hapus pengelolaan limbah
    const result = await query(`DELETE FROM pengelolaan_limbah WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Pengolahan limbah tidak ditemukan" });
    }

    return res.status(200).json({ msg: "Pengolahan limbah dan catatan terkait berhasil dihapus" });
  } catch (error) {
    console.error("Error pada hapusPengolahanLimbah:", error.message);
    return res.status(400).json({
      msg: "Gagal menghapus pengolahan limbah",
      error: error.message,
    });
  }
};

// Controller: Get Detail Pengolahan Limbah
const getDetailPengolahanLimbah = async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const pengolahanLimbah = await query(
      `SELECT p.id, l.nama_limbah, l.gambar, p.target_olahan, p.tgl_mulai, p.tgl_selesai, p.status
       FROM pengelolaan_limbah p
       JOIN limbah l ON p.limbah_id = l.id
       WHERE p.id = ? AND l.user_id = ?`,
      [id, user_id]
    );

    if (pengolahanLimbah.length === 0) {
      return res.status(404).json({ msg: "Pengolahan limbah tidak ditemukan" });
    }

    const catatanPeriode = await query(
      `SELECT tgl_mulai, tgl_selesai, catatan 
       FROM catatan_pengelolahan 
       WHERE pengolahan_id = ?`,
      [id]
    );

    const result = {
      ...pengolahanLimbah[0],
      catatanPeriode: catatanPeriode || [],
    };

    return res.status(200).json({
      msg: "Berhasil mendapatkan detail pengolahan limbah",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Gagal mendapatkan detail pengolahan limbah",
      error: error.message,
    });
  }
};

// Controller: Edit Pengolahan Limbah
const editPengolahanLimbah = async (req, res) => {
  const { id } = req.params;
  const { limbah_id, target_olahan, tgl_mulai, tgl_selesai, status, catatanPeriode } = req.body;
  const email = req.user.email;

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // Verifikasi apakah user_id memiliki akses ke pengolahan limbah ini
    const pengolahan = await query(
      `SELECT * FROM pengelolaan_limbah p 
       JOIN limbah l ON p.limbah_id = l.id 
       WHERE p.id = ? AND l.user_id = ?`,
      [id, user_id]
    );

    if (pengolahan.length === 0) {
      return res.status(403).json({ msg: "Anda tidak memiliki akses untuk mengedit pengolahan ini" });
    }

    const result = await query(
      `UPDATE pengelolaan_limbah 
       SET target_olahan = ?, tgl_mulai = ?, tgl_selesai = ?, status = ? 
       WHERE id = ?`,
      [target_olahan, tgl_mulai, tgl_selesai, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Pengolahan limbah tidak ditemukan" });
    }

    // Menghapus catatan periode lama jika ada
    await query(`DELETE FROM catatan_pengelolahan WHERE pengolahan_id = ?`, [id]);

    if (catatanPeriode && catatanPeriode.length > 0) {
      const values = catatanPeriode.map((catatan) => [
        id,
        catatan.tgl_mulai,
        catatan.tgl_selesai,
        catatan.catatan,
      ]);

      await query(
        `INSERT INTO catatan_pengelolahan (pengolahan_id, tgl_mulai, tgl_selesai, catatan) VALUES ?`,
        [values]
      );
    }

    return res.status(200).json({ msg: "Pengolahan limbah berhasil diperbarui" });
  } catch (error) {
    console.error("Error pada editPengolahanLimbah:", error.message);
    return res.status(400).json({
      msg: "Gagal memperbarui pengolahan limbah",
      error: error.message,
    });
  }
};




export { tambahPengolahanLimbah, getAllPengolahanLimbah, hapusPengolahanLimbah, getDetailPengolahanLimbah, editPengolahanLimbah };
