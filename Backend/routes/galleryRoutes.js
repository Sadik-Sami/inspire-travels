const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// GET /api/gallery - Fetch all gallery items with pagination and filters
router.get('/', async (req, res) => {
	try {
		const {
			page = 1,
			limit = 12,
			category = 'all',
			search = '',
			sortBy = 'createdAt',
			sortOrder = 'desc',
			isActive = 'all',
		} = req.query;

		// Build filter object
		const filter = {};

		if (category !== 'all') {
			filter.category = category;
		}

		if (isActive !== 'all') {
			filter.isActive = isActive === 'true';
		}

		if (search) {
			filter.$text = { $search: search };
		}

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Calculate pagination
		const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

		// Execute queries
		const [items, totalCount] = await Promise.all([
			Gallery.find(filter)
				.populate('createdBy', 'name email')
				.populate('updatedBy', 'name email')
				.sort(sort)
				.skip(skip)
				.limit(Number.parseInt(limit)),
			Gallery.countDocuments(filter),
		]);

		// Get category statistics
		const categoryStats = await Gallery.aggregate([
			{ $match: { isActive: true } },
			{ $group: { _id: '$category', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / Number.parseInt(limit));
		const hasNextPage = Number.parseInt(page) < totalPages;
		const hasPrevPage = Number.parseInt(page) > 1;

		res.status(200).json({
			success: true,
			data: {
				items,
				pagination: {
					currentPage: Number.parseInt(page),
					totalPages,
					totalCount,
					hasNextPage,
					hasPrevPage,
					limit: Number.parseInt(limit),
				},
				categoryStats: categoryStats.reduce((acc, stat) => {
					acc[stat._id] = stat.count;
					return acc;
				}, {}),
			},
		});
	} catch (error) {
		console.error('Error fetching gallery items:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch gallery items',
			error: error.message,
		});
	}
});

// GET /api/gallery/:id - Get single gallery item
router.get('/:id', async (req, res) => {
	try {
		const item = await Gallery.findById(req.params.id)
			.populate('createdBy', 'name email')
			.populate('updatedBy', 'name email');

		if (!item) {
			return res.status(404).json({
				success: false,
				message: 'Gallery item not found',
			});
		}

		res.status(200).json({
			success: true,
			data: item,
		});
	} catch (error) {
		console.error('Error fetching gallery item:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch gallery item',
			error: error.message,
		});
	}
});

// POST /api/gallery - Upload image and create gallery item
router.post('/', verifyUser, verifyRole('admin', 'moderator'), upload.single('image'), async (req, res) => {
	try {
		const { title, content, category, tags } = req.body;

		// Validate required fields
		if (!title || !content || !category) {
			return res.status(400).json({
				success: false,
				message: 'Title, content, and category are required',
			});
		}

		// Check if image was uploaded
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'Image is required',
			});
		}

		// Upload image to Cloudinary using existing helper
		const uploadResult = await uploadImage(req.file);

		// Parse tags if provided
		let parsedTags = [];
		if (tags) {
			try {
				parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
			} catch (error) {
				parsedTags = typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()) : [];
			}
		}

		// Create gallery item
		const galleryItem = new Gallery({
			title,
			content,
			category,
			tags: parsedTags,
			image: {
				url: uploadResult.url,
				publicId: uploadResult.publicId,
			},
			createdBy: req.user._id,
		});

		await galleryItem.save();

		// Populate the created item
		await galleryItem.populate('createdBy', 'name email');

		res.status(201).json({
			success: true,
			message: 'Gallery item created successfully',
			data: galleryItem,
		});
	} catch (error) {
		console.error('Error creating gallery item:', error);

		// Clean up uploaded image if database save fails
		if (req.file && error.name === 'ValidationError') {
			try {
				// If we have the upload result, clean it up
				// This would require modifying the uploadImage function to return more details
				// For now, we'll log the error
				console.error('Database save failed, but image was uploaded. Manual cleanup may be required.');
			} catch (cleanupError) {
				console.error('Error cleaning up uploaded image:', cleanupError);
			}
		}

		res.status(500).json({
			success: false,
			message: 'Failed to create gallery item',
			error: error.message,
		});
	}
});

// PUT /api/gallery/:id - Update gallery item (without re-uploading image)
router.put('/:id', verifyUser, verifyRole('admin', 'moderator'), async (req, res) => {
	try {
		const { title, content, category, tags, isActive } = req.body;

		const item = await Gallery.findById(req.params.id);
		if (!item) {
			return res.status(404).json({
				success: false,
				message: 'Gallery item not found',
			});
		}

		// Parse tags if provided
		let parsedTags = item.tags;
		if (tags !== undefined) {
			try {
				parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
			} catch (error) {
				parsedTags = typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()) : [];
			}
		}

		// Update fields
		const updateData = {
			updatedBy: req.user._id,
		};

		if (title !== undefined) updateData.title = title;
		if (content !== undefined) updateData.content = content;
		if (category !== undefined) updateData.category = category;
		if (tags !== undefined) updateData.tags = parsedTags;
		if (isActive !== undefined) updateData.isActive = isActive;

		const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
			.populate('createdBy', 'name email')
			.populate('updatedBy', 'name email');

		res.status(200).json({
			success: true,
			message: 'Gallery item updated successfully',
			data: updatedItem,
		});
	} catch (error) {
		console.error('Error updating gallery item:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update gallery item',
			error: error.message,
		});
	}
});

// DELETE /api/gallery/:id - Delete gallery item and image from Cloudinary
router.delete('/:id', verifyUser, verifyRole('admin', 'moderator'), async (req, res) => {
	try {
		const item = await Gallery.findById(req.params.id);
		if (!item) {
			return res.status(404).json({
				success: false,
				message: 'Gallery item not found',
			});
		}

		// Delete image from Cloudinary using existing helper
		try {
			await deleteImage(item.image.publicId);
		} catch (cloudinaryError) {
			console.error('Error deleting image from Cloudinary:', cloudinaryError);
			// Continue with database deletion even if Cloudinary deletion fails
		}

		// Delete from database
		await Gallery.findByIdAndDelete(req.params.id);

		res.status(200).json({
			success: true,
			message: 'Gallery item deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting gallery item:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete gallery item',
			error: error.message,
		});
	}
});

module.exports = router;
