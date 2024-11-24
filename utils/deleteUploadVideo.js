import path from "path";
import fs from "fs";

function deleteUploadVideo(thumbnail, video) {
  if (thumbnail) {
    // Cek apakah thumbnail tidak null
    const hapusgambar = path.resolve("upload/video/thumb", thumbnail);

    // Hapus file gambar jika ada
    if (fs.existsSync(hapusgambar)) {
      fs.promises.unlink(hapusgambar);
    }
  }

  if (video) {
    // Cek apakah video tidak null
    const hapusvideo = path.resolve("upload/video/video", video);

    // Hapus file video jika ada
    if (fs.existsSync(hapusvideo)) {
      fs.promises.unlink(hapusvideo);
    }
  }
}

export { deleteUploadVideo };
