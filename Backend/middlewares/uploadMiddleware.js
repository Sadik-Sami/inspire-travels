const multer = require('multer');
const path = require('path');

// Configure memory storage (no disk save)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
	const filetypes = /jpeg|jpg|png|webp/;
	const mimetype = filetypes.test(file.mimetype);
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

	if (mimetype && extname) {
		return cb(null, true);
	}
	cb(new Error('Only image files are allowed!'));
};

// Initialize upload
const upload = multer({
	storage: storage, // use memory storage
	limits: { fileSize: 5000000 }, // 5MB limit
	fileFilter: fileFilter,
});

module.exports = upload;
