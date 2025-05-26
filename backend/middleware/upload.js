const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userId = req.userId || 'anon';
      const folderId = req.query?.folder_id || req.body?.folder_id || 'general';
      const uploadPath = path.join(__dirname, '..', 'uploads', String(userId), String(folderId));
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });
module.exports = upload;