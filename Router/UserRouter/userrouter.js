import express from "express";
import {
  deleteAdmin,
  getUserAdmin,
  updateAdmin,
} from "../../Controller/UserController/usercontroller.js";
import { validasi } from "../../middleware/validasi.js";

const userrouter = express();

userrouter.get("/getadmin", getUserAdmin);
userrouter.put("/updateadmin/:id", [
  validasi(["email", "nama_lengkap"]),
  updateAdmin,
]);
userrouter.delete("/deleteadmin/:id", deleteAdmin);

export default userrouter;
