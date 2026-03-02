const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base upload directory
const BASE_UPLOAD_PATH = path.join(__dirname, "uploads");

// Ensure base upload folder exists
if (!fs.existsSync(BASE_UPLOAD_PATH)) {
    fs.mkdirSync(BASE_UPLOAD_PATH, { recursive: true });
}

// Allowed mime types
const allowedMimes = {
    image: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ],
    audio: [
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/m4a"
    ],
    pdf: [
        "application/pdf"
    ]
};

// Get folder based on file type
const getUploadFolder = (mimetype) => {
    if (allowedMimes.image.includes(mimetype)) return "images";
    if (allowedMimes.audio.includes(mimetype)) return "audio";
    if (allowedMimes.pdf.includes(mimetype)) return "pdf";
    return "others";
};

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = getUploadFolder(file.mimetype);
        const uploadPath = path.join(BASE_UPLOAD_PATH, folderName);

        // Create folder if not exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allAllowedMimes = [
        ...allowedMimes.image,
        ...allowedMimes.audio,
        ...allowedMimes.pdf
    ];

    if (allAllowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images, audio files, and PDFs are allowed!"), false);
    }
};

// Multer instance
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter
});

module.exports = upload;