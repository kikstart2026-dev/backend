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
    ],
    video: [
        "video/mp4",
        "video/mkv",
        "video/x-matroska",
        "video/quicktime",   // mov
        "video/x-msvideo"    // avi
    ]
};

// Get folder based on file type
const getUploadFolder = (mimetype) => {
    if (allowedMimes.image.includes(mimetype)) return "images";
    if (allowedMimes.audio.includes(mimetype)) return "audio";
    if (allowedMimes.pdf.includes(mimetype)) return "pdf";
    if (allowedMimes.video.includes(mimetype)) return "videos";
    return "others";
};

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = getUploadFolder(file.mimetype);
        const uploadPath = path.join(BASE_UPLOAD_PATH, folderName);

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
        ...allowedMimes.pdf,
        ...allowedMimes.video
    ];

    if (allAllowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images, audio, video files and PDFs are allowed!"), false);
    }
};

// Multer instance
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB for video
    },
    fileFilter
});

module.exports = upload;