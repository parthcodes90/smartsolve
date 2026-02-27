const multer = require('multer');

/**
 * Upload Middleware (Phase-1)
 * Uses Memory Storage for Photo Uploads
 * Files are passed to the StorageService as buffers
 */
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Single photo per complaint in Phase-1
    },
    fileFilter: (req, file, cb) => {
        // Only accept common image formats
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only images are allowed'), false);
        }
    }
});

module.exports = upload;
