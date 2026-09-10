const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const useCloudinary = process.env.UPLOAD_STORAGE === 'cloudinary';
const uploadDirectory = path.join(__dirname, 'public', 'uploads');

let storage;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
    });

    storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'homebound_DEV',
            allowed_formats: ['png', 'jpg', 'jpeg'],
        },
    });
} else {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    storage = multer.diskStorage({
        destination: uploadDirectory,
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        },
    });
}

module.exports = {
    cloudinary,
    storage,
    useCloudinary,
};
