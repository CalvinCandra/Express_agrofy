import { query } from "../../database/database.js";

const getAllRiwayat = async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, pl.status, l.nama_limbah
      FROM riwayat r
      JOIN pengelolah_limbah pl ON r.pengelolah_id = pl.id
      JOIN limbah l ON pl.limbah_id = l.id
    `);
    return res
      .status(200)
      .json({ msg: "Berhasil mengambil data", data: result });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

export { getAllRiwayat };
