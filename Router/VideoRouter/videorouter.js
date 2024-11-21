import express from "express";
import {
  getVideo,
  getVideoDetail,
  deleteVideo,
  updateVideo,
  tambahVideo,
} from "../../Controller/VideoController/videocontroller.js";
import { validasi } from "../../middleware/validasi.js";
import { uploadVideo } from "../../middleware/upload.js";

const videorouter = express();

videorouter.get("/getvideo", getVideo);
videorouter.get("/getvideodetail/:id", getVideoDetail);
videorouter.post(
  "/tambahvideo",
  [
    uploadVideo.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    validasi(["judul", "deskripsi", "email", "kategori_id"]),
  ],
  tambahVideo
);
videorouter.put(
  "/updatevideo/:id",
  [
    uploadVideo.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    validasi(["judul", "deskripsi", "email", "kategori_id"]),
  ],
  updateVideo
);
videorouter.delete("/deletevideo/:id", deleteVideo);

export default videorouter;
