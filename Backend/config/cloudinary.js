require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.path, {
			folder: 'travel-destinations',
			use_filename: true,
		});
		return {
			url: result.secure_url,
			publicId: result.public_id,
		};
	} catch (error) {
		console.error('Error uploading to Cloudinary:', error);
		throw new Error('Image upload failed');
	}
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
	try {
		await cloudinary.uploader.destroy(publicId);
		return { message: 'Image deleted successfully' };
	} catch (error) {
		console.error('Error deleting from Cloudinary:', error);
		throw new Error('Image deletion failed');
	}
};

module.exports = { uploadImage, deleteImage };
