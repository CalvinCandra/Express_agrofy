import { query } from "../../database/database.js";

const getProfile = async (req, res) => {
  try {
    const result = await query("SELECT * FROM user WHERE id = ?", [
      req.user.id,
    ]);
    return res
      .status(200)
      .json({ msg: "Berhasil mengambil data", data: result });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal mengambil data", error });
  }
};

const editProfile = async (req, res) => {
  const { name, email } = req.body; // Data yang ingin diubah
  try {
    // Update data profil
    const result = await query(
      "UPDATE user SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    return res.status(200).json({ msg: "Berhasil mengedit profil" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal mengedit profil", error });
  }
};

export { getProfile, editProfile };
