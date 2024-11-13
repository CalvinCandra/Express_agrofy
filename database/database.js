import mysql from "mysql2/promise";
import dotenv from "dotenv";

// init .env
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Ngecek Jaringan Koneksi
async function koneksi() {
  try {
    await db.getConnection();
    console.log("Koneksi Berhasil");
  } catch (error) {
    console.log("Koneksi Gagagl", error);
  }
}

export default koneksi;
