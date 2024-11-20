import express from "express";
import {
  getVideo,
  getVideoDetail,
  deleteVideo,
  updateVideo,
  tambahVideo,
} from "../../Controller/VideoController/videocontroller.js";

const videorouter = express();

videorouter.get("/getvideo", getVideo);
videorouter.get("/getvideodetail/:id", getVideoDetail);
videorouter.post("/tambahvideo", tambahVideo);
videorouter.put("/updatevideo/:id", updateVideo);
videorouter.delete("/deletevideo/:id", deleteVideo);

export default videorouter;
