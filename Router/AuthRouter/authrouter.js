import express from "express";
import {
  register,
  login,
} from "../../Controller/AuthController/authcontroller.js";
import { validasi } from "../../middleware/validasi.js";

const authrouter = express();

authrouter.post("/register", [
  validasi(["nama_lengkap", "email", "password", "confirmPassword"]),
  register,
]);
authrouter.post("/login", [validasi(["email", "password"]), login]);

export default authrouter;
