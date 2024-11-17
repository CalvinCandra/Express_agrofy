import express from "express";
import {
  deleteAdmin,
  getUserAdmin,
  updateAdmin,
} from "../../Controller/UserController/usercontroller.js";

const userrouter = express();

userrouter.get("/getadmin", getUserAdmin);
userrouter.put("/updateadmin/:id", updateAdmin);
userrouter.delete("/deleteadmin/:id", deleteAdmin);

export default userrouter;
