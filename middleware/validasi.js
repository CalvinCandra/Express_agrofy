const validasi = (requiredFields) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ msg: `${field} wajib diisi` });
      }
    }
    next();
  };
};

export { validasi };
