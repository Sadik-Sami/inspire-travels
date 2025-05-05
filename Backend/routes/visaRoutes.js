const express = require('express');
const router = express.Router();
const Visa = require('../models/Visa');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const upload = require('../middlewares/uploadMiddleware');

// Helper function to transform nested fields
const transformNestedFields = (data) => {
	const transformedData = { ...data };

	// Handle pricing object
	if (data.basePrice || data.discountedPrice || data.currency) {
		transformedData.pricing = {
			basePrice: Number.parseFloat(data.basePrice) || 0,
			discountedPrice: Number.parseFloat(data.discountedPrice) || Number.parseFloat(data.basePrice) || 0,
			currency: data.currency || 'USD',
		};

		// Remove individual fields
		delete transformedData.basePrice;
		delete transformedData.discountedPrice;
		delete transformedData.currency;
	}

	return transformedData;
};

// Get all visas (public)
router.get('/', async (req, res) => {
	try {
		const page = Number.parseInt(req.query.page) || 1;
		const limit = Number.parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Build filter object
		const filter = { isActive: true };

		// Search by title
		if (req.query.search) {
			filter.title = { $regex: req.query.search, $options: 'i' };
		}

		// Price range filter
		if (req.query.minPrice) {
			filter['pricing.basePrice'] = { $gte: Number.parseFloat(req.query.minPrice) };
		}
		if (req.query.maxPrice) {
			if (filter['pricing.basePrice']) {
				filter['pricing.basePrice'].$lte = Number.parseFloat(req.query.maxPrice);
			} else {
				filter['pricing.basePrice'] = { $lte: Number.parseFloat(req.query.maxPrice) };
			}
		}

		// Get visas with pagination
		const visas = await Visa.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

		// Get total count for pagination
		const total = await Visa.countDocuments(filter);

		res.status(200).json({
			visas,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching visas:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Get a specific visa by slug (public)
router.get('/slug/:slug', async (req, res) => {
	try {
		const visa = await Visa.findOne({ slug: req.params.slug, isActive: true }).lean();

		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		res.status(200).json({ visa });
	} catch (error) {
		console.error('Error fetching visa:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Get a specific visa by ID (public)
router.get('/:id', async (req, res) => {
	try {
		const visa = await Visa.findOne({ _id: req.params.id, isActive: true }).lean();

		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		res.status(200).json({ visa });
	} catch (error) {
		console.error('Error fetching visa:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Admin routes

// Get all visas (admin, including inactive)
router.get('/admin/all', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const page = Number.parseInt(req.query.page) || 1;
		const limit = Number.parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Build filter object
		const filter = {};

		// Status filter
		if (req.query.status === 'active') {
			filter.isActive = true;
		} else if (req.query.status === 'inactive') {
			filter.isActive = false;
		}

		// Search by title
		if (req.query.search) {
			filter.title = { $regex: req.query.search, $options: 'i' };
		}

		// Get visas with pagination
		const visas = await Visa.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

		// Get total count for pagination
		const total = await Visa.countDocuments(filter);

		res.status(200).json({
			visas,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching visas:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Create a new visa (admin only)
router.post('/', verifyUser, verifyRole('admin'), upload.array('images', 10), async (req, res) => {
	try {
		const { title, shortDescription, description, basePrice, discountedPrice, currency } = req.body;

		// Validate required fields
		if (!title || !shortDescription || !description || !basePrice) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// Transform data
		const visaData = transformNestedFields(req.body);

		// Create slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');

		// Check if slug already exists
		const existingVisa = await Visa.findOne({ slug });
		if (existingVisa) {
			return res.status(400).json({ message: 'A visa package with this title already exists' });
		}

		// Process uploaded images
		const images = [];
		let coverImage = null;

		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const result = await uploadImage(file);
				images.push({
					url: result.url,
					publicId: result.publicId,
					alt: `${title} visa image`,
				});

				// Use first image as cover if no cover specified
				if (!coverImage) {
					coverImage = {
						url: result.url,
						publicId: result.publicId,
						alt: `${title} visa cover image`,
					};
				}
			}
		}

		// Create new visa
		const newVisa = new Visa({
			...visaData,
			slug,
			images,
			coverImage,
		});

		await newVisa.save();

		res.status(201).json({
			message: 'Visa package created successfully',
			visa: newVisa,
		});
	} catch (error) {
		console.error('Error creating visa:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Update a visa (admin only)
router.put('/:id', verifyUser, verifyRole('admin'), upload.array('newImages', 10), async (req, res) => {
	try {
		const visaId = req.params.id;
		const { title, shortDescription, description, basePrice, discountedPrice, currency, isActive } = req.body;

		// Find visa
		const visa = await Visa.findById(visaId);
		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		// Transform data
		const visaData = transformNestedFields(req.body);

		// Update slug if title changed
		if (title && title !== visa.title) {
			const newSlug = title
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-');

			// Check if new slug already exists
			const existingVisa = await Visa.findOne({ slug: newSlug, _id: { $ne: visaId } });
			if (existingVisa) {
				return res.status(400).json({ message: 'A visa package with this title already exists' });
			}

			visaData.slug = newSlug;
		}

		// Process new images
		if (req.files && req.files.length > 0) {
			const newImages = [];

			for (const file of req.files) {
				const result = await uploadImage(file);
				newImages.push({
					url: result.url,
					publicId: result.publicId,
					alt: `${visa.title} visa image`,
				});
			}

			// Add new images to existing ones
			visaData.images = [...(visa.images || []), ...newImages];

			// Set cover image if none exists
			if (!visa.coverImage && newImages.length > 0) {
				visaData.coverImage = {
					url: newImages[0].url,
					publicId: newImages[0].publicId,
					alt: `${visa.title} visa cover image`,
				};
			}
		}

		// Handle deleted images
		if (req.body.deletedImages) {
			const deletedImages = Array.isArray(req.body.deletedImages) ? req.body.deletedImages : [req.body.deletedImages];

			// Delete images from Cloudinary
			for (const publicId of deletedImages) {
				await deleteImage(publicId);
			}

			// Remove deleted images from visa
			if (visa.images && visa.images.length > 0) {
				visaData.images = visa.images.filter((image) => !deletedImages.includes(image.publicId));
			}

			// Update cover image if it was deleted
			if (visa.coverImage && deletedImages.includes(visa.coverImage.publicId)) {
				visaData.coverImage =
					visaData.images.length > 0
						? {
								url: visaData.images[0].url,
								publicId: visaData.images[0].publicId,
								alt: `${visa.title} visa cover image`,
						  }
						: null;
			}
		}

		// Update visa with all changes
		const updatedVisa = await Visa.findByIdAndUpdate(visaId, { $set: visaData }, { new: true, runValidators: true });

		res.status(200).json({
			message: 'Visa package updated successfully',
			visa: updatedVisa,
		});
	} catch (error) {
		console.error('Error updating visa:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Delete a visa (admin only)
router.delete('/:id', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const visa = await Visa.findById(req.params.id);

		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		// Delete all images from Cloudinary
		if (visa.images && visa.images.length > 0) {
			for (const image of visa.images) {
				await deleteImage(image.publicId);
			}
		}

		// Delete cover image if different from other images
		if (visa.coverImage && visa.coverImage.publicId) {
			const isInImages = visa.images.some((img) => img.publicId === visa.coverImage.publicId);
			if (!isInImages) {
				await deleteImage(visa.coverImage.publicId);
			}
		}

		// Delete visa from database
		await Visa.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: 'Visa package deleted successfully' });
	} catch (error) {
		console.error('Error deleting visa:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Toggle visa active status (admin only)
router.patch('/:id/toggle-status', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const visa = await Visa.findById(req.params.id);

		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		visa.isActive = !visa.isActive;
		await visa.save();

		res.status(200).json({
			message: `Visa package ${visa.isActive ? 'activated' : 'deactivated'} successfully`,
			isActive: visa.isActive,
		});
	} catch (error) {
		console.error('Error toggling visa status:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

module.exports = router;
