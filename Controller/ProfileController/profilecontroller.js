import { query } from "../../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

// Mendapatkan data profil
const getProfile = async (req, res) => {
  const email = req.user.email;

  try {
    const result = await query("SELECT * FROM user WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    return res
      .status(200)
      .json({ msg: "Berhasil mengambil data", data: result[0] });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal mengambil data", error });
  }
};

// Mengupdate data profil
const editProfile = async (req, res) => {
  const { nama_lengkap, email } = req.body; // Nama baru dan email baru
  const currentEmail = req.user.email; // Email pengguna yang sedang login

  // Validasi input
  if (!nama_lengkap || !email) {
    return res.status(400).json({ msg: "Nama dan email wajib diisi" });
  }

  try {
    // Ambil ID pengguna berdasarkan email login
    const userResult = await query("SELECT id FROM user WHERE email = ?", [
      currentEmail,
    ]);

    if (userResult.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userId = userResult[0].id;

    // Update data profil berdasarkan ID pengguna
    const updateResult = await query(
      "UPDATE user SET nama_lengkap = ?, email = ? WHERE id = ?",
      [nama_lengkap, email, userId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ msg: "Gagal memperbarui profil" });
    }

    const result = await query("SELECT * FROM user WHERE id = ?", [userId]);

    return res
      .status(200)
      .json({ msg: "Profil berhasil diperbarui", data: result });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ msg: "Terjadi kesalahan saat mengupdate profil", error });
  }
};

// Mengubah password
const editPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const currentEmail = req.user?.email;

    // Validasi input
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ msg: "Password dan konfirmasi harus diisi" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "Password tidak cocok" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "Password harus minimal 8 karakter" });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Perbarui password di database
    const result = await query("UPDATE user SET password = ? WHERE email = ?", [
      hashedPassword,
      currentEmail,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    }

    // Respons berhasil
    return res.status(200).json({ msg: "Password berhasil diubah" });
  } catch (error) {
    // Penanganan kesalahan
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Terjadi kesalahan pada server", error });
  }
};

// Mengunah gambar profile
const editGambar = async (req, res) => {
  const currentEmail = req.user.email; // Email pengguna yang sedang login
  const newFoto = req.file ? req.file.filename : null;

  try {
    // Ambil ID pengguna berdasarkan email login
    const userResult = await query("SELECT id FROM user WHERE email = ?", [
      currentEmail,
    ]);

    if (userResult.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userId = userResult[0].id;

    // Ambil file lama jika ada
    const fotoResult = await query("SELECT foto FROM user WHERE id = ?", [
      userId,
    ]);
    const oldFoto = fotoResult[0]?.foto;

    // Jika ada gambar baru, hapus gambar lama
    if (newFoto && oldFoto) {
      const oldFotoPath = path.resolve("upload/profile/", oldFoto);

      try {
        if (fs.existsSync(oldFotoPath)) {
          await fs.promises.unlink(oldFotoPath); // Hapus file lama
        }
      } catch (err) {
        console.error("Gagal menghapus gambar lama:", err);
      }
    }

    // Update hanya jika ada file baru
    if (newFoto) {
      await query("UPDATE user SET foto = ? WHERE id = ?", [newFoto, userId]);
    }

    return res.status(200).json({
      msg: "Gambar berhasil diubah",
      data: {
        foto: newFoto || oldFoto,
      },
    });
  } catch (error) {
    console.error("Error saat memperbarui gambar:", error);
    return res.status(500).json({
      msg: "Gambar gagal diubah",
      error: error.message || "Terjadi kesalahan",
    });
  }
};

export { getProfile, editProfile, editPassword, editGambar };
