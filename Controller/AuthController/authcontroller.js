import { query } from "../../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// register
const register = async (req, res) => {
  const {
    nama_lengkap,
    email,
    password,
    confirmPassword,
    foto = null,
    role = "user",
  } = req.body;

  // validasi password dan confirmasi password
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Password tidak cocok" });
  }

  // cek apakah ada email yang sama
  const cekMail = await query("SELECT * FROM user WHERE email = ?", [email]);

  if (cekMail.length > 0) {
    return res.status(400).json({ msg: "Email sudah terdaftar" });
  }

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

    // Jika login berhasil, buatkan JWT
    const token = await jwt.sign(
      {
        name: user[0].nama_lengkap,
        email: user[0].email,
        role: user[0].role,
        foto: user[0].foto,
      },
      "MIICXAIBAAKBgQCZb+m7rqQxTPHRLPR4lY/gCDOVbeymXWFgjhyGbueEW/+ot9WbqkpZpUk6NllvqAS06ff4uRz0LBaUO6vWIgQdy9H+gdIB336Fwccp7gTOCqBeZs7kQkjRXQtxD2emXGbLHrLXYskivA05gp0OOEdDydQReqPoNDKVYIuI9ABzTQIDAQABAoGACowX3A/oN39bjA50C6n0Rukpapcw0krO+80pBtCu13lffKCObXHqRHlJLFg6E6PQFwOSSSWoaNxy/OORL1oNQEeA5w+etq+heQ4KSVgljyQRo/GWiO0R0G8r04gK8ssiO9oLEMV5OQXG4SRvgl18UOSz6YJpwqnWva6tlSQCBf0CQQDoGOBrGNjfiogajC+/jheeXLpshXWEpUts8LkA9AHyiotPqY0KOzzeWw/c26SOUz8OFb2RhkwSV92AkIBNTwmjAkEAqT00j+N6Ws71U9j84m+06OVAk5NVa0GVc8E8PZb/RfHmk5nsJ68599djXVKOmdUyiKsNQfnOKWOjges/HQ0+TwJBAIP+ecqOc/AVYbfvV8xRq971D1ReReos8ws+j4gaPO1Jm1avrzVNYR13njrVcu06LJb/CDM1tBeOfrr58u2EcI8CQFx2oicTI6BFfmfHH7MfUPoFdtiqIHsvI9ZQdvc3blTqqw1thUbRR5yPQyyTlHGbt7ZPrjijoO2gEI9E1gCrYaUCQBoOqbsiKmiqZayJvQZ8UFbWZe0EWIOajPDpqzEZRickjPBPC4ZG8d62pWYmc1M45lHrcGKz9zoj1lJFvx87Jy8=",
      { expiresIn: "6h" }
    );

    // Jika login berhasil, periksa role pengguna
    if (user[0].role === "admin") {
      // Jika role admin
      return res.status(200).json({
        token: `Bearer ${token}`,
        msg: `${user[0].nama_lengkap} Berhasil Login`,
        role: `${user[0].role}`,
        email: `${user[0].email}`,
        nama: `${user[0].nama_lengkap}`,
        foto: `${user[0].foto}`,
      });
    } else if (user[0].role === "user") {
      // Jika role user
      return res.status(200).json({
        token: `Bearer ${token}`,
        msg: `${user[0].nama_lengkap} Berhasil Login`,
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
