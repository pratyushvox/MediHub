import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { handleFileUpload } from '../../controllers/Fileupload/Fileuploadcontroller.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup - Updated to include user ID in filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      try {
        // Get userId from either body or query (whichever you're using)
        const userId = req.body.userId || req.query.userId;
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${userId}-${uniqueSuffix}-${file.originalname}`);
      } catch (error) {
        cb(error); // Properly pass the error to Multer
      }
    }
  });
  
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
// === ROUTES === //

// Upload a document - Now requires userId in form data
router.post('/upload', upload.single('document'), handleFileUpload);

// Get all documents for specific user - Now requires userId query parameter
router.get('/', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Failed to read files' });

    // Filter files by user ID (files should start with userId-)
    const userFiles = files.filter(filename => filename.startsWith(`${userId}-`));

    const fileList = userFiles.map((filename) => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);

      // Extract original name (remove userId and unique suffix)
      const parts = filename.split('-');
      const originalname = parts.slice(2).join('-');

      return {
        filename,
        originalname,
        type: getFileTypeFromExtension(filename),
        size: stats.size,
        uploadDate: stats.birthtime,
        userId
      };
    });

    res.status(200).json(fileList);
  });
});

// Download a document - Now verifies user owns the file
router.get('/download/:filename', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const filename = req.params.filename;
  if (!filename.startsWith(`${userId}-`)) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.download(filePath);
});

// Delete a document - Now verifies user owns the file
router.delete('/:filename', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const filename = req.params.filename;
  if (!filename.startsWith(`${userId}-`)) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete file' });
    res.status(200).json({ message: 'File deleted successfully' });
  });
});

// Helper to get file type
function getFileTypeFromExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (ext === '.docx') return 'Word';
  if (ext === '.xlsx') return 'Excel';
  if (ext === '.jpg' || ext === '.jpeg') return 'Image';
  if (ext === '.png') return 'Image';
  return 'Unknown';
}

export default router;