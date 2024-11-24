import { query } from "../../database/database.js";

const getUserIdByEmail = async (email) => {
  const result = await query("SELECT id FROM user WHERE email = ?", [email]);
  return result.length > 0 ? result[0].id : null;
};

// Controller: Tambah Pengolahan Limbah
const tambahPengolahanLimbah = async (req, res) => {
    const { limbah_id, target_olahan, tgl_mulai, tgl_selesai, status, catatanPeriode } = req.body;
    const email = req.user.email;
  
    try {
      const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

      // Menambahkan data ke tabel pengelolaan limbah
      const result = await query(
        `INSERT INTO pengelolaan_limbah (limbah_id, target_olahan, tgl_mulai, tgl_selesai, status) VALUES (?, ?, ?, ?, ?)`,
        [limbah_id, target_olahan, tgl_mulai, tgl_selesai, status]
      );
  
      const pengolahanId = result.insertId; // ID pengolahan limbah yang baru
  
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
      console.error("Error pada tambahPengolahanLimbah:", error.message); // Pesan error
      console.error("Detail lengkap:", error); // Detail error jika diperlukan
  
      return res.status(400).json({
        msg: "Gagal menambahkan pengolahan limbah",
        error: error.message, // Menampilkan pesan error kepada klien
      });
    }
  };
  

// Controller: Ambil Semua Pengolahan Limbah
// Controller: Ambil Semua Pengolahan Limbah Berdasarkan User Login
const getAllPengolahanLimbah = async (req, res) => {
  const email = req.user.email;

  try {
    // Ambil user_id berdasarkan email
    const userResult = await query("SELECT id FROM user WHERE email = ?", [email]);

    // Jika user tidak ditemukan
    if (userResult.length === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
      });
    }

    const user_id = userResult[0].id;

    // Ambil data pengolahan limbah yang sesuai dengan user_id
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
    // Hapus catatan terkait pengelolaan limbah
    await query(`DELETE FROM catatan_pengelolahan WHERE pengolahan_id = ?`, [id]);

    // Hapus pengelolaan limbah
    const result = await query(`DELETE FROM pengelolaan_limbah WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Pengolahan limbah tidak ditemukan" });
    }

    return res.status(200).json({ msg: "Pengolahan limbah dan catatan terkait berhasil dihapus" });
  } catch (error) {
    console.error("Error pada hapusPengolahanLimbah:", error.message); // Log error
    console.error("Detail lengkap:", error); // Log detailed error

    return res.status(400).json({
      msg: "Gagal menghapus pengolahan limbah",
      error: error.message,
    });
  }
};


const getDetailPengolahanLimbah = async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }
    // Ambil data pengolahan limbah
    const pengolahanLimbah = await query(
      `SELECT p.id, l.nama_limbah, l.gambar, p.target_olahan, p.tgl_mulai, p.tgl_selesai, p.status
       FROM pengelolaan_limbah p
       JOIN limbah l ON p.limbah_id = l.id
       WHERE p.id = ?`,
      [id]
    );

    if (pengolahanLimbah.length === 0) {
      return res.status(404).json({ msg: "Pengolahan limbah tidak ditemukan" });
    }

    // Ambil data catatan pengolahan limbah
    const catatanPeriode = await query(
      `SELECT tgl_mulai, tgl_selesai, catatan 
       FROM catatan_pengelolahan 
       WHERE pengolahan_id = ?`,
      [id]
    );

    // Gabungkan data pengolahan limbah dengan catatan
    const result = {
      ...pengolahanLimbah[0],
      catatanPeriode: catatanPeriode || [], // Jika tidak ada catatan, kirim array kosong
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
// Controller: Edit Pengolahan Limbah
// Controller: Edit Pengolahan Limbah
const editPengolahanLimbah = async (req, res) => {
  const { id } = req.params; // ID pengolahan limbah yang akan diedit
  const { limbah_id, target_olahan, tgl_mulai, tgl_selesai, status, catatanPeriode } = req.body;
  const email = req.user.email;

  try {
    const user_id = await getUserIdByEmail(email);
    if (!user_id) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }
    // Update data pengolahan limbah
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

    // Menambahkan catatan periode baru jika ada
    if (catatanPeriode && catatanPeriode.length > 0) {
      const values = catatanPeriode.map((catatan) => [
        id, // ID pengolahan limbah
        catatan.tgl_mulai,
        catatan.tgl_selesai,
        catatan.catatan,
      ]);

      await query(
        `INSERT INTO catatan_pengelolahan (pengolahan_id, tgl_mulai, tgl_selesai, catatan) VALUES ?`,
        [values]
      );
    }

    // Handle status "selesai" and "gagal"
    let riwayatId = null;

    if (status === 'selesai' || status === 'gagal') {
      // Insert into riwayat_pengolahan
      const riwayatResult = await query(
        `INSERT INTO riwayat (pengelolaan_id, tgl_selesai) 
         VALUES (?, ?)`,
        [id, tgl_selesai]
      );

      riwayatId = riwayatResult.insertId; // Get the ID of the inserted riwayat record

      // Insert into hasil_olahan only if the status is "selesai"
      if (status === 'selesai') {
        await query(
          `INSERT INTO hasil_olahan (riwayat_id) 
           VALUES (?)`,
          [riwayatId]
        );
      }
    }

    return res.status(200).json({
      msg: "Pengolahan limbah berhasil diperbarui",
      pengolahan_id: id,
      riwayat_id: riwayatId,
    });
  } catch (error) {
    console.error("Error pada editPengolahanLimbah:", error.message);
    console.error("Detail lengkap:", error);

    return res.status(400).json({
      msg: "Gagal memperbarui pengolahan limbah",
      error: error.message,
    });
  }
};




export { tambahPengolahanLimbah, getAllPengolahanLimbah, hapusPengolahanLimbah, getDetailPengolahanLimbah, editPengolahanLimbah };
