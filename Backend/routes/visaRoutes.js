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

	// Map longDescription to description if it exists
	if (data.longDescription) {
		transformedData.description = data.longDescription;
		delete transformedData.longDescription;
	}

	return transformedData;
};

router.get('/featured', async (req, res) => {
	try {
		const featured = await Visa.find({ featured: true });
		res.status(200).json(featured);
	} catch (error) {
		console.error('Error fetching featured visas', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// ===== ADMIN ROUTES =====
// Get all visas (admin, including inactive)
router.get('/admin/all', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
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

		// Filter by from country
		if (req.query.from) {
			filter.from = { $regex: req.query.from, $options: 'i' };
		}

		// Filter by to country
		if (req.query.to) {
			filter.to = { $regex: req.query.to, $options: 'i' };
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

		// Sort parameter
		let sort = { createdAt: -1 }; // Default sort by newest
		if (req.query.sortBy) {
			const [field, direction] = req.query.sortBy.split('-');
			sort = { [field]: direction === 'asc' ? 1 : -1 };
		}

		// Get visas with pagination
		const visas = await Visa.find(filter).sort(sort).skip(skip).limit(limit).lean();

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

// Toggle visa featured status (admin only)
router.patch('/:id/toggle-featured', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const visa = await Visa.findById(req.params.id);

		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		visa.featured = !visa.featured;
		await visa.save();

		res.status(200).json({
			message: `Visa package ${visa.featured ? 'featured' : 'unfeatured'} successfully`,
			featured: visa.featured,
		});
	} catch (error) {
		console.error('Error toggling visa featured status:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// ===== PUBLIC ROUTES =====

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

		// Filter by from country
		if (req.query.from) {
			filter.from = { $regex: req.query.from, $options: 'i' };
		}

		// Filter by to country
		if (req.query.to) {
			filter.to = { $regex: req.query.to, $options: 'i' };
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

// ===== ADMIN MUTATION ROUTES =====

// Create a new visa (admin only)
router.post('/', verifyUser, verifyRole('admin', 'employee'), upload.array('photos', 10), async (req, res) => {
	try {
		const { title, shortDescription, description, basePrice, currency, from, to } = req.body;
		const coverImageIndex = req.body.coverImageIndex ? Number.parseInt(req.body.coverImageIndex) : 0;

		// Validate required fields
		if (!title || !shortDescription || !description || !basePrice || !from || !to) {
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
			for (const [index, file] of req.files.entries()) {
				const result = await uploadImage(file);
				const imageData = {
					url: result.url,
					publicId: result.publicId,
					alt: `${title} visa image`,
				};

				images.push(imageData);

				// Set cover image
				if (index === coverImageIndex) {
					coverImage = { ...imageData, alt: `${title} visa cover image` };
				}
			}

			// If no cover image was specified, use the first image
			if (!coverImage && images.length > 0) {
				coverImage = { ...images[0], alt: `${title} visa cover image` };
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
router.put('/:id', verifyUser, verifyRole('admin', 'employee'), upload.array('newPhotos', 10), async (req, res) => {
	try {
		const visaId = req.params.id;
		const { title, shortDescription, description, basePrice, currency, from, to, isActive } = req.body;
		const coverImageId = req.body.coverImageId;
		const newCoverImageIndex = req.body.newCoverImageIndex ? Number.parseInt(req.body.newCoverImageIndex) : null;

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
		const newImages = [];
		let newCoverImage = null;

		if (req.files && req.files.length > 0) {
			for (const [index, file] of req.files.entries()) {
				const result = await uploadImage(file);
				const imageData = {
					url: result.url,
					publicId: result.publicId,
					alt: `${visa.title} visa image`,
				};

				newImages.push(imageData);

				// Set new cover image if specified
				if (newCoverImageIndex !== null && index === newCoverImageIndex) {
					newCoverImage = { ...imageData, alt: `${visa.title} visa cover image` };
				}
			}
		}

		// Add new images to existing ones
		visaData.images = [...(visa.images || []), ...newImages];

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
				// If a new cover image was selected, use that
				if (newCoverImage) {
					visaData.coverImage = newCoverImage;
				}
				// Otherwise, use the first remaining image
				else if (visaData.images.length > 0) {
					visaData.coverImage = {
						url: visaData.images[0].url,
						publicId: visaData.images[0].publicId,
						alt: `${visa.title} visa cover image`,
					};
				} else {
					visaData.coverImage = null;
				}
			}
		}

		// Update cover image if specified
		if (coverImageId) {
			const selectedImage = visaData.images.find((img) => img.publicId === coverImageId);
			if (selectedImage) {
				visaData.coverImage = {
					url: selectedImage.url,
					publicId: selectedImage.publicId,
					alt: `${visa.title} visa cover image`,
				};
			}
		} else if (newCoverImage) {
			visaData.coverImage = newCoverImage;
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
router.delete('/:id', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
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
router.patch('/:id/toggle-status', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
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

// Toggle visa featured status (admin only)
router.patch('/:id/toggle-featured', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const visa = await Visa.findById(req.params.id);

		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		visa.featured = !visa.featured;
		await visa.save();

		res.status(200).json({
			message: `Visa package ${visa.featured ? 'featured' : 'unfeatured'} successfully`,
			featured: visa.featured,
		});
	} catch (error) {
		console.error('Error toggling visa featured status:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

module.exports = router;
