const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const fs = require('fs');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const transformNestedFields = (data) => {
	const transformed = {};

	for (const key in data) {
		const value = data[key];

		// If key has dot notation (e.g., "location.from"), nest it properly
		if (key.includes('.')) {
			const keys = key.split('.');
			let current = transformed;

			keys.forEach((k, index) => {
				if (index === keys.length - 1) {
					// Convert values correctly (Booleans, Numbers, Arrays)
					current[k] = value === 'true' ? true : value === 'false' ? false : isNaN(value) ? value : Number(value);
				} else {
					current[k] = current[k] || {};
					current = current[k];
				}
			});
		} else {
			// Handle non-nested fields
			transformed[key] = value === 'true' ? true : value === 'false' ? false : isNaN(value) ? value : Number(value);
		}
	}

	return transformed;
};

// @route GET /api/destinations
// @desc Get all destinations with filtering, pagination and search
// @access Public
router.get('/', async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			sort,
			direction = 'desc',
			status = 'active',
			minPrice,
			maxPrice,
			minDuration,
			maxDuration,
			featured,
			popular,
			search,
			from,
			to,
			categories,
		} = req.query;

		console.log('Sort param received:', sort, 'direction:', direction);

		// Build query
		const query = {};

		// Improved search functionality with regex for partial matches
		if (search && search.trim() !== '') {
			// Create a regex search that matches from the beginning of words
			const searchRegex = new RegExp(`^${search}|\\s${search}`, 'i');

			// Use $or to search across multiple fields
			query.$or = [
				{ title: { $regex: searchRegex } },
				{ summary: { $regex: searchRegex } },
				{ description: { $regex: searchRegex } },
				{ 'location.from': { $regex: searchRegex } },
				{ 'location.to': { $regex: searchRegex } },
			];
		}

		// Category filter
		if (categories) {
			const categoryArray = Array.isArray(categories) ? categories : [categories];
			query.categories = { $in: categoryArray };
		}

		// Price range filter
		if (minPrice || maxPrice) {
			query['pricing.basePrice'] = {};
			if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
			if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
		}

		// Duration range filter
		if (minDuration || maxDuration) {
			query['duration.days'] = {};
			if (minDuration) query['duration.days'].$gte = Number(minDuration);
			if (maxDuration) query['duration.days'].$lte = Number(maxDuration);
		}

		// Status filter (for admin)
		if (status) {
			query.status = status;
		} else {
			// By default, only show active destinations to public
			query.status = 'active';
		}

		// Featured filter
		if (featured === 'true') {
			query.isFeatured = true;
		}

		// Popular filter
		if (popular === 'true') {
			query.isPopular = true;
		}

		// Location filters
		if (from) {
			query['location.from'] = { $regex: from, $options: 'i' };
		}

		if (to) {
			query['location.to'] = { $regex: to, $options: 'i' };
		}

		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Sort options
		const sortOptions = {};

		// Handle special sort cases
		if (sort === 'popular') {
			sortOptions.isPopular = direction === 'asc' ? 1 : -1;
			// Add secondary sort for consistent results
			sortOptions.createdAt = -1;
		} else if (sort === 'rating') {
			sortOptions.rating = direction === 'asc' ? 1 : -1;
		} else if (sort === 'newest' || sort === 'createdAt') {
			sortOptions.createdAt = direction === 'asc' ? 1 : -1;
		} else if (sort === 'price') {
			// Handle price sorting
			sortOptions['pricing.basePrice'] = direction === 'asc' ? 1 : -1;
		} else if (sort === 'duration') {
			// Handle duration sorting
			sortOptions['duration.days'] = direction === 'asc' ? 1 : -1;
		} else if (sort && sort.includes('.')) {
			// Handle nested fields (e.g., pricing.basePrice)
			sortOptions[sort] = direction === 'asc' ? 1 : -1;
		} else if (sort) {
			// Handle regular fields
			sortOptions[sort] = direction === 'asc' ? 1 : -1;
		} else {
			// Default sort
			sortOptions.createdAt = -1;
		}

		console.log('Sort field:', sort, 'direction:', direction);
		console.log('MongoDB sort options:', sortOptions);

		// Execute query with pagination
		const destinations = await Destination.find(query)
			.sort(sortOptions)
			.skip(skip)
			.limit(Number(limit))
			.populate('createdBy', 'name');

		// Get total count for pagination
		const total = await Destination.countDocuments(query);

		res.json({
			destinations,
			totalPages: Math.ceil(total / Number(limit)),
			currentPage: Number(page),
			total,
		});
	} catch (error) {
		console.error('Error fetching destinations:', error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
});

// @route GET /api/destinations/featured
// @desc Get featured destinations
// @access Public
router.get('/featured', async (req, res) => {
	try {
		const limit = Number.parseInt(req.query.limit) || 6;

		const destinations = await Destination.find({
			isFeatured: true,
			status: 'active',
		})
			.sort({ createdAt: -1 })
			.limit(limit);

		res.status(200).json({ success: true, destinations });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/destinations/popular
// @desc Get popular destinations
// @access Public
router.get('/popular', async (req, res) => {
	try {
		const limit = Number.parseInt(req.query.limit) || 6;

		const destinations = await Destination.find({
			isPopular: true,
			status: 'active',
		})
			.sort({ createdAt: -1 })
			.limit(limit);

		res.status(200).json({ success: true, destinations });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/destinations/categories
// @desc Get all unique categories
// @access Public
router.get('/categories', async (req, res) => {
	try {
		const categories = await Destination.distinct('categories');
		res.status(200).json({ success: true, categories });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/destinations/search
// @desc Search destinations with various filters
// @access Public
router.get('/search', async (req, res) => {
	try {
		const { query, category, minPrice, maxPrice, from, to } = req.query;

		const filter = { status: 'active' };

		// Text search
		if (query) {
			filter.$text = { $search: query };
		}

		// Category filter
		if (category && category !== 'all') {
			filter.categories = category;
		}

		// Price range filter
		if (minPrice || maxPrice) {
			filter['pricing.basePrice'] = {};
			if (minPrice) filter['pricing.basePrice'].$gte = Number(minPrice);
			if (maxPrice) filter['pricing.basePrice'].$lte = Number(maxPrice);
		}

		// Location filter
		if (from) {
			filter['location.from'] = { $regex: from, $options: 'i' };
		}

		if (to) {
			filter['location.to'] = { $regex: to, $options: 'i' };
		}

		// Execute query
		const destinations = await Destination.find(filter).sort(
			query ? { score: { $meta: 'textScore' } } : { createdAt: -1 }
		);

		res.status(200).json({ success: true, destinations });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/destinations/:id
// @desc Get a single destination by ID
// @access Public
router.get('/:id', async (req, res) => {
	try {
		const destination = await Destination.findById(req.params.id).populate('createdBy', 'name');

		if (!destination) {
			return res.status(404).json({ message: 'Destination not found' });
		}

		res.json(destination);
	} catch (error) {
		console.error('Error fetching destination:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route POST /api/destinations
// @desc Create a new destination
// @access Private (Admin only)
router.post('/', verifyUser, verifyRole('admin'), upload.array('images', 5), async (req, res) => {
	try {
		const { title, description, price, location, duration, category, transportation, accommodation, featured, status } =
			req.body;
		const parsedData = transformNestedFields(req.body);
		console.log(parsedData);
		// Create new destination
		const destination = new Destination({
			...parsedData,
			featured: featured === 'true',
			status: status || 'active',
			createdBy: req.user._id,
			images: [],
		});
		console.log(destination);
		// Upload images to Cloudinary
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const result = await uploadImage(file);
				destination.images.push(result);

				// Clean up uploaded file
				fs.unlinkSync(file.path);
			}
		}

		// Save destination to database
		await destination.save();

		res.status(201).json(destination);
	} catch (error) {
		console.error('Error creating destination:', error);

		// Clean up any uploaded files
		if (req.files) {
			req.files.forEach((file) => {
				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}
			});
		}

		res.status(500).json({ message: 'Server Error' });
	}
});

router.put('/:id', verifyUser, verifyRole('admin'), upload.array('images', 5), async (req, res) => {
	try {
		const destination = await Destination.findById(req.params.id);

		if (!destination) {
			return res.status(404).json({ message: 'Destination not found' });
		}

		// Parse the form data using the transformNestedFields helper
		const parsedData = transformNestedFields(req.body);
		console.log('Parsed update data:', parsedData);

		// Handle image deletion
		if (req.body.deleteImages) {
			const imagesToDelete = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];

			// Filter out deleted images from the destination
			destination.images = destination.images.filter((img) => !imagesToDelete.includes(img._id.toString()));
		}

		// Upload new images
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				try {
					const result = await uploadImage(file);
					destination.images.push(result);

					// Clean up uploaded file
					fs.unlinkSync(file.path);
				} catch (error) {
					console.error('Error uploading image:', error);
				}
			}
		}

		// Update destination with parsed data
		// We use Object.assign to update all fields at once
		Object.assign(destination, parsedData);

		// Save updated destination
		await destination.save();

		res.json({ success: true, destination });
	} catch (error) {
		console.error('Error updating destination:', error);

		// Clean up any uploaded files
		if (req.files) {
			req.files.forEach((file) => {
				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}
			});
		}

		res.status(500).json({ message: 'Server Error', error: error.message });
	}
});

// @route DELETE /api/destinations/:id
// @desc Delete destination
// @access Private (Admin only)
router.delete('/:id', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const destination = await Destination.findById(req.params.id);

		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		// Delete images from Cloudinary
		for (const image of destination.images) {
			if (image._id) {
				await deleteImage(image._id);
			}
		}

		// Delete destination from database
		await Destination.findByIdAndDelete(req.params.id);

		res.status(200).json({ success: true, message: 'Destination deleted successfully' });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route DELETE /api/destinations/:destinationId/images/:imageId
// @desc Delete an image from a destination
// @access Private (Admin only)
router.delete('/:destinationId/images/:imageId', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { destinationId, imageId } = req.params;

		const destination = await Destination.findById(destinationId);

		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		// Find the image by its _id
		const imageIndex = destination.images.findIndex((img) => img._id.toString() === imageId);

		if (imageIndex === -1) {
			return res.status(404).json({ success: false, message: 'Image not found' });
		}

		// Remove the image from the images array
		destination.images.splice(imageIndex, 1);

		// Save the updated destination
		await destination.save();

		res.status(200).json({ success: true, message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Error deleting image:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route PATCH /api/destinations/:id/status
// @desc Update destination status
// @access Private (Admin only)
router.patch('/:id/status', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { status } = req.body;

		if (!['draft', 'active', 'inactive'].includes(status)) {
			return res.status(400).json({ success: false, message: 'Invalid status value' });
		}

		const destination = await Destination.findById(req.params.id);

		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		destination.status = status;
		await destination.save();

		res.status(200).json({ success: true, destination });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route PATCH /api/destinations/:id/feature
// @desc Toggle featured status
// @access Private (Admin only)
router.patch('/:id/feature', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const destination = await Destination.findById(req.params.id);

		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		destination.isFeatured = !destination.isFeatured;
		await destination.save();

		res.status(200).json({ success: true, destination });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route PATCH /api/destinations/:id/popular
// @desc Toggle popular status
// @access Private (Admin only)
router.patch('/:id/popular', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const destination = await Destination.findById(req.params.id);

		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		destination.isPopular = !destination.isPopular;
		await destination.save();

		res.status(200).json({ success: true, destination });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
