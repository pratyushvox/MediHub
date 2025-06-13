export const handleFileUpload = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    // Verify userId was received
    if (!req.body.userId) {
      // Clean up the uploaded file if any
      if (req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error cleaning up file:', err);
        });
      }
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        userId: req.body.userId,
        size: req.file.size,
        uploadDate: new Date()
      }
    });
  };