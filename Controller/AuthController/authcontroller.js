import { query } from "../../database/database.js";
import bcrypt from "bcrypt";

// register
const register = async (req, res) => {
  const {
    nama_lengkap,
    email,
    password,
    foto = null,
    role = "user",
  } = req.body;

  //set timestamp otomatis
  const timestamp = new Date();

  //set untuk password enkripsi
  const enkripsi = await bcrypt.hash(password, 10);

  try {
    await query(
      `INSERT INTO user (nama_lengkap, email, password, foto, role, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`,
      [nama_lengkap, email, enkripsi, foto, role, timestamp, timestamp]
    );
    return res.status(200).json({
      msg: "User Berhasil Register",
      data: {
        ...req.body,
      },
    });
  } catch (error) {
    return res.status(400).json({
      msg: "User Gagal Register",
      error,
    });
  }
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await query("SELECT * FROM user WHERE email = ?", [email]);

    if (user.length === 0) {
      // Jika user tidak ditemukan
      return res.status(400).json({
        msg: "User tidak ditemukan",
      });
    }

    // Verifikasi password menggunakan bcrypt
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      // Jika password tidak cocok
      return res.status(400).json({
        msg: "Password salah",
      });
    }

    // Jika login berhasil, periksa role pengguna
    if (user[0].role === "admin") {
      // Jika role admin, arahkan ke halaman admin
      return res.status(200).json({
        msg: `${user[0].nama_lengkap} Berhasil Login`,
        role: `${user[0].role}`,
        email: `${user[0].email}`,
        nama: `${user[0].nama_lengkap}`,
        foto: `${user[0].foto}`,
      });
    } else if (user[0].role === "user") {
      // Jika role user, arahkan ke halaman user
      return res.status(200).json({
        msg: `${user[0].nama_lengkap} Berhasil Login Sebagai User`,
        role: `${user[0].role}`,
        email: `${user[0].email}`,
        nama: `${user[0].nama_lengkap}`,
        foto: `${user[0].foto}`,
      });
    } else {
      // Jika role tidak dikenali
      return res.status(400).json({
        msg: "Role tidak dikenali",
      });
    }
  } catch (error) {
    console.log("Error login:", error);
    return res.status(500).json({
      msg: "Terjadi kesalahan saat login",
      error,
    });
  }
};

export { register, login };
