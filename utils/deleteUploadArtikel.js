import path from "path";
import fs from "fs";

function deleteUploadArtikel(gambar) {
  const oldThumbnailPath = path.resolve("upload/artikel/", gambar);

  if (fs.existsSync(oldThumbnailPath)) {
    fs.promises.unlink(oldThumbnailPath); // Hapus file lama
  }
}

export { deleteUploadArtikel };
