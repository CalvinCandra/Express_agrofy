import express from "express";
import path from "path";
import authrouter from "./AuthRouter/authrouter.js";
import limbahrouter from "./MenejementRouter/limbahrouter.js";
import userrouter from "./UserRouter/userrouter.js";
import kategorirouter from "./KategoriRouter/kategorirouter.js";
import artikelrouter from "./ArtikelRouter/artikelrouter.js";
import videorouter from "./VideoRouter/videorouter.js";
import komunitasrouter from "./KomunitasRouter/komunitasrouter.js";
import indikatorrouter from "./MenejementRouter/indikatorrouter.js";
import passport from "../middleware/passport.js";
import profilerouter from "./ProfileRouter/profilerouter.js";
import riwayatrouter from "./MenejementRouter/riwayatrouter.js";

const Router = express();
const api = "/api/v1";

// kirim link alias untuk di akses di react
Router.use(
  "/artikel",
  express.static(path.join(process.cwd(), "upload/artikel"))
);

// kirim link alias untuk di akses di react
Router.use(
  "/video",
  express.static(path.join(process.cwd(), "upload/video/video"))
);

// kirim link alias untuk di akses di react
Router.use(
  "/komunitas",
  express.static(path.join(process.cwd(), "upload/komunitas"))
);

Router.use(
  "/thumb",
  express.static(path.join(process.cwd(), "upload/video/thumb"))
);

Router.use(
  "/profile",
  express.static(path.join(process.cwd(), "upload/profile"))
);

// Middleware untuk melayani file statis
Router.use("/uploads", express.static(path.join(process.cwd(), "img/upload")));
// `process.cwd()` akan merujuk ke direktori root proyek saat aplikasi dijalankan

// Rute Auth
Router.use(api, authrouter);

// Rute User Admin
Router.use(
  api,
  passport.authenticate("internal-rule", { session: false }),
  userrouter
);

// Rute kategori
Router.use(
  api,
  passport.authenticate("internal-rule", { session: false }),
  kategorirouter
);

// Rute Artikel
Router.use(
  api,
  passport.authenticate("internal-rule", { session: false }),
  artikelrouter
);

// Rute video
Router.use(
  api,
  passport.authenticate("internal-rule", { session: false }),
  videorouter
);

// Rute komunitas
Router.use(
  api,
  passport.authenticate("internal-rule", { session: false }),
  komunitasrouter
);

// Rute Limbah
Router.use(api, limbahrouter);

// Rute indikator
Router.use(api, indikatorrouter);

// Rute profile
Router.use(api, profilerouter);

// Rute riwayat
Router.use(api, riwayatrouter);

export default Router;
