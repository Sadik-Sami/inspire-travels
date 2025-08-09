require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper for streaming upload
const streamUpload = (buffer, options) => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
			if (result)
				resolve({
					url: result.secure_url,
					publicId: result.public_id,
				});
			else reject(error);
		});
		streamifier.createReadStream(buffer).pipe(stream);
	});
};

// Upload image to Cloudinary (for destinations, visas, blogs - high quality)
const uploadImage = async (file) => {
	try {
		return await streamUpload(file.buffer, {
			folder: 'travel-destinations',
			use_filename: true,
		});
	} catch (error) {
		console.error('Error uploading to Cloudinary:', error);
		throw new Error('Image upload failed');
	}
};

// Upload user profile image to Cloudinary (optimized for profile pictures)
const uploadUserImage = async (file) => {
	try {
		return await streamUpload(file.buffer, {
			folder: 'travel-users',
			use_filename: true,
			transformation: [
				{ width: 400, height: 400, crop: 'fill', gravity: 'face' },
				{ quality: 'auto', fetch_format: 'auto' },
			],
		});
	} catch (error) {
		console.error('Error uploading user image to Cloudinary:', error);
		throw new Error('User image upload failed');
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

module.exports = { uploadImage, uploadUserImage, deleteImage };
