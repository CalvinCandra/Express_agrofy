import express from "express";
import {
  getProfile,
  editProfile,
  editPassword,
  editGambar,
} from "../../Controller/ProfileController/profilecontroller.js";
import passport from "../../middleware/passport.js";
import { uploadProfile } from "../../middleware/upload.js";

const router = express.Router();

router.get(
  "/profile",
  passport.authenticate("internal-rule", { session: false }),
  getProfile
);

// Perbarui profil pengguna
router.put(
  "/profile",
  passport.authenticate("internal-rule", { session: false }), // Autentikasi
  editProfile
);

// Perbarui profil pengguna
router.put(
  "/profile/password",
  passport.authenticate("internal-rule", { session: false }), // Autentikasi
  editPassword
);

// Perbarui foto profil pengguna
router.put(
  "/profile/updatefoto",
  passport.authenticate("internal-rule", { session: false }), // Autentikasi
  uploadProfile.single("foto"), // Middleware upload gambar
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ msg: "File gambar tidak ditemukan" });
    }
    next();
  },
  editGambar
);

export default router;
