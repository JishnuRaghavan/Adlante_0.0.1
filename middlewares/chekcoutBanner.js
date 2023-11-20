const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/bannerimg'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const chekcoutBannerUpload = multer({
  storage: storage
});

module.exports = (req, res, next) => {
  chekcoutBannerUpload.single('checkoutBannerImage')(req, res, (err) => {
    if (err) {
      // Handle multer error, e.g., file size exceeded, file type not allowed
      return res.status(400).json({ error: 'File upload failed.' });
    }
    // File upload successful, call next to proceed to the next middleware/route handler
    next();
  });
};
