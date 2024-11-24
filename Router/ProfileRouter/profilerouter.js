import express from "express";
import { getProfile } from "../../Controller/ProfileController/profilecontroller.js";

const router = express.Router();

router.get("/profile", getProfile);

export default router;
