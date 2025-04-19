// cloudinary/cloudinaryUpload.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/Cloudinary.js'; // make sure this path is correct

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures', // this is the Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }]
  }
});

const upload = multer({ storage });

export default upload;
