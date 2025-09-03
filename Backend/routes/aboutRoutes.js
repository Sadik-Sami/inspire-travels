const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// @route   GET /api/about
// @desc    Get about page content (public)
// @access  Public
router.get('/', async (req, res) => {
	try {
		const about = await About.findOne({ isActive: true })
			.populate('createdBy', 'name email')
			.populate('updatedBy', 'name email')
			.sort({ createdAt: -1 });

		if (!about) {
			return res.status(404).json({
				success: false,
				message: 'About page content not found',
			});
		}

		res.status(200).json({
			success: true,
			data: about,
		});
	} catch (error) {
		console.error('Error fetching about content:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route   GET /api/about/admin
// @desc    Get about page content for admin (includes inactive)
// @access  Private (Admin/Moderator)
router.get('/admin', verifyUser, verifyRole('admin', 'moderator'), async (req, res) => {
	try {
		const about = await About.findOne()
			.populate('createdBy', 'name email')
			.populate('updatedBy', 'name email')
			.sort({ createdAt: -1 });

		if (!about) {
			return res.status(404).json({
				success: false,
				message: 'About page content not found',
			});
		}

		res.status(200).json({
			success: true,
			data: about,
		});
	} catch (error) {
		console.error('Error fetching about content for admin:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route   POST /api/about
// @desc    Create about page content
// @access  Private (Admin/Moderator)
router.post('/', verifyUser, verifyRole('admin', 'moderator'), upload.single('image'), async (req, res) => {
	try {
		const { title, content, happyTravelers, destinations, yearsOfExperience, averageRating, satisfiedCustomers } =
			req.body;

		// Check if about page already exists
		const existingAbout = await About.findOne();
		if (existingAbout) {
			return res.status(400).json({
				success: false,
				message: 'About page content already exists. Use update instead.',
			});
		}

		// Validate required fields
		if (!title || !content) {
			return res.status(400).json({
				success: false,
				message: 'Title and content are required',
			});
		}

		// Check if image is provided
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'Image is required',
			});
		}

		// Upload image to Cloudinary
		const uploadResult = await uploadImage(req.file);

		// Create about page content
		const about = new About({
			title,
			content,
			image: {
				url: uploadResult.url,
				publicId: uploadResult.publicId,
			},
			happyTravelers: Number.parseInt(happyTravelers) || 0,
			destinations: Number.parseInt(destinations) || 0,
			yearsOfExperience: Number.parseInt(yearsOfExperience) || 0,
			averageRating: Number.parseFloat(averageRating) || 0,
			satisfiedCustomers: Number.parseInt(satisfiedCustomers) || 0,
			createdBy: req.user._id,
		});

		await about.save();

		// Populate user data
		await about.populate('createdBy', 'name email');

		res.status(201).json({
			success: true,
			message: 'About page content created successfully',
			data: about,
		});
	} catch (error) {
		console.error('Error creating about content:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route   PUT /api/about/:id
// @desc    Update about page content
// @access  Private (Admin/Moderator)
router.put('/:id', verifyUser, verifyRole('admin', 'moderator'), upload.single('image'), async (req, res) => {
	try {
		const {
			title,
			content,
			happyTravelers,
			destinations,
			yearsOfExperience,
			averageRating,
			satisfiedCustomers,
			isActive,
		} = req.body;

		const about = await About.findById(req.params.id);
		if (!about) {
			return res.status(404).json({
				success: false,
				message: 'About page content not found',
			});
		}

		// Update fields
		if (title) about.title = title;
		if (content) about.content = content;
		if (happyTravelers !== undefined) about.happyTravelers = Number.parseInt(happyTravelers);
		if (destinations !== undefined) about.destinations = Number.parseInt(destinations);
		if (yearsOfExperience !== undefined) about.yearsOfExperience = Number.parseInt(yearsOfExperience);
		if (averageRating !== undefined) about.averageRating = Number.parseFloat(averageRating);
		if (satisfiedCustomers !== undefined) about.satisfiedCustomers = Number.parseInt(satisfiedCustomers);
		if (isActive !== undefined) about.isActive = isActive === 'true' || isActive === true;

		// Handle image update
		if (req.file) {
			// Delete old image from Cloudinary
			if (about.image && about.image.publicId) {
				try {
					await deleteImage(about.image.publicId);
				} catch (deleteError) {
					console.error('Error deleting old image:', deleteError);
				}
			}

			// Upload new image
			const uploadResult = await uploadImage(req.file);
			about.image = {
				url: uploadResult.url,
				publicId: uploadResult.publicId,
			};
		}

		about.updatedBy = req.user._id;
		await about.save();

		// Populate user data
		await about.populate('createdBy', 'name email');
		await about.populate('updatedBy', 'name email');

		res.status(200).json({
			success: true,
			message: 'About page content updated successfully',
			data: about,
		});
	} catch (error) {
		console.error('Error updating about content:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route   DELETE /api/about/:id
// @desc    Delete about page content
// @access  Private (Admin only)
router.delete('/:id', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const about = await About.findById(req.params.id);
		if (!about) {
			return res.status(404).json({
				success: false,
				message: 'About page content not found',
			});
		}

		// Delete image from Cloudinary
		if (about.image && about.image.publicId) {
			try {
				await deleteImage(about.image.publicId);
			} catch (deleteError) {
				console.error('Error deleting image from Cloudinary:', deleteError);
			}
		}

		await About.findByIdAndDelete(req.params.id);

		res.status(200).json({
			success: true,
			message: 'About page content deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting about content:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

module.exports = router;
