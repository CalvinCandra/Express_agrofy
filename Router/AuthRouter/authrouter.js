import express from "express";
import {
  register,
  login,
} from "../../Controller/AuthController/authcontroller.js";

const authrouter = express();

authrouter.post("/register", register);
authrouter.post("/login", login);

export default authrouter;
