import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed MIME types and their Cloudinary resource_type
const ALLOWED = {
  'image/jpeg':      'image',
  'image/jpg':       'image',
  'image/png':       'image',
  'image/gif':       'image',
  'image/webp':      'image',
  'application/pdf': 'raw',
};

const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = ALLOWED[file.mimetype] || 'raw';
    return {
      folder:        'swavio_chat',
      resource_type: resourceType,
      use_filename:  true,
      unique_filename: true,
    };
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'swavio_profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    use_filename:  true,
    unique_filename: true,
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Unsupported file type: ${file.mimetype}`));
  }
}

function profileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed for profile pictures'));
  }
}

export const upload = multer({
  storage:    chatStorage,
  fileFilter,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const uploadProfile = multer({
  storage:    profileStorage,
  fileFilter: profileFilter,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Express error handler for Multer errors — call next(err) or respond directly
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File too large. Maximum size is 5 MB.' });
    }
    return res.status(400).json({ message: err.message || 'File upload error.' });
  }
  next(err);
}

// Export cloudinary instance so controllers can call cloudinary.uploader.destroy()
export { cloudinary };
