import validator from "validator";
import DOMPurify from "isomorphic-dompurify";

const validasi = (requiredFields, excludeFields = []) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ msg: `${field} wajib diisi` });
      }

      // Sanitasi input (hapus karakter berbahaya)
      if (!excludeFields.includes(field)) {
        req.body[field] = validator.escape(req.body[field]);
      } else {
        // karakter kode yang diperbolehkan, ini berfungsi untuk CKEditor
        req.body[field] = DOMPurify.sanitize(req.body[field], {
          ALLOWED_TAGS: ["b", "i", "em", "strong", "p"],
        });
      }
    }
    next();
  };
};

export { validasi };
