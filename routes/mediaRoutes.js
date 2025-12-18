const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// POST /api/media/upload - Upload a single image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file: ' + error.message });
  }
});

// POST /api/media/upload-multiple - Upload multiple images
router.post('/upload-multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(201).json({
      message: `${files.length} file(s) uploaded successfully`,
      files: files
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload files: ' + error.message });
  }
});

// GET /api/media/files - Get list of all uploaded files
router.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename: filename,
        path: `/uploads/${filename}`,
        size: stats.size,
        uploadedAt: stats.birthtime
      };
    });

    res.status(200).json({
      count: files.length,
      files: files
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files: ' + error.message });
  }
});

// GET /api/media/:filename - Get a specific file
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file: ' + error.message });
  }
});

// DELETE /api/media/:filename - Delete a specific file
router.delete('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: 'File deleted successfully', filename: filename });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file: ' + error.message });
  }
});

module.exports = router;

