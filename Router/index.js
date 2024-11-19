import express from "express";
import path from "path";
import authrouter from "./AuthRouter/authrouter.js";
import limbahrouter from "./MenejementRouter/limbahrouter.js";
import userrouter from "./UserRouter/userrouter.js";
import kategorirouter from "./KategoriRouter/kategorirouter.js";
import artikelrouter from "./ArtikelRouter/artikelrouter.js";
import indikatorrouter from "./MenejementRouter/indikatorrouter.js";

const Router = express();
const api = "/api/v1";

// Middleware untuk melayani file statis
Router.use("/uploads", express.static(path.join(process.cwd(), "img/upload"))); 
// `process.cwd()` akan merujuk ke direktori root proyek saat aplikasi dijalankan

// Rute Auth
Router.use(api, authrouter);

// Rute User Admin
Router.use(api, userrouter);

// Rute kategori
Router.use(api, kategorirouter);

// Rute Artikel
Router.use(api, artikelrouter);

// Rute Limbah
Router.use(api, limbahrouter);

// Rute indikator
Router.use(api, indikatorrouter);

export default Router;
