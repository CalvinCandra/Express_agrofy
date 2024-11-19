import { query } from "../../database/database.js";

// Ambil semua data pengolahan limbah
const getAllPengolahanLimbah = async (req, res) => {
  try {
    const result = await query("SELECT * FROM pengolahan_limbah");
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching pengolahan limbah:", error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

// Hitung jumlah data berdasarkan status
const getPengolahanLimbahByStatus = async (req, res) => {
  const { status } = req.params; // Ambil parameter status
  try {
    const result = await query(
      "SELECT COUNT(*) AS count FROM pengolahan_limbah WHERE status = $1",
      [status]
    );
    res.status(200).json({ success: true, count: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    console.error("Error fetching pengolahan limbah by status:", error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

const getAllHasilOlahan = async (req, res) => {
    try {
      const result = await query("SELECT * FROM hasil_olahan");
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error fetching hasil olahan:", error);
      res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
  };
  
  // Hitung jumlah data hasil olahan
const getHasilOlahanCount = async (req, res) => {
    try {
      const result = await query("SELECT COUNT(*) AS count FROM hasil_olahan");
      res.status(200).json({ success: true, count: parseInt(result.rows[0].count, 10) });
    } catch (error) {
      console.error("Error fetching hasil olahan count:", error);
      res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
  };

  export { getAllPengolahanLimbah, getPengolahanLimbahByStatus, getAllHasilOlahan, getHasilOlahanCount };
