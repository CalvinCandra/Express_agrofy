import multer from "multer";
import path from "path";
import fs from "fs";

// ======================================================================================== ARTIKEL
const storageArtikel = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "upload/artikel/";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  },
});

const uploadArtikel = multer({
  storage: storageArtikel,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar dengan format .jpg, .jpeg, atau .png"));
    }
  },
});

// ======================================================================================== Video
const storageVideo = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, "upload/video/video");
    } else if (file.mimetype.startsWith("image/")) {
      cb(null, "upload/video/thumb");
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

const uploadVideo = multer({
  storage: storageVideo,
  limits: {
    fileSize: (req, file) => {
      if (file.mimetype.startsWith("video/")) {
        return 500 * 1024 * 1024; // 10 MB
      } else if (file.mimetype.startsWith("image/")) {
        return 5 * 1024 * 1024; // 5 MB
      }
    },
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      video: /mp4|mkv/,
      thumbnail: /jpg|jpeg|png/,
    };
    const isAllowed = allowedTypes[file.fieldname].test(
      path.extname(file.originalname).toLowerCase()
    );
    cb(null, isAllowed);
  },
});

// ======================================================================================== Komunitas
const storageKomunitas = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "upload/komunitas/";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  },
});

const uploadKomunitas = multer({
  storage: storageKomunitas,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimum 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar dengan format .jpg, .jpeg, atau .png"));
    }
  },
});

// ======================================================================================== Profile
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "upload/profile/";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  },
});

const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimum 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar dengan format .jpg, .jpeg, atau .png"));
    }
  },
});

export { uploadArtikel, uploadVideo, uploadKomunitas, uploadProfile };
