const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const fs = require('fs');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const path = require('path');

// Helper function to transform nested fields
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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route GET /api/blogs
// @desc Get all blogs with filtering, pagination and search
// @access Public
router.get('/', async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			sort,
			direction = 'desc',
			status,
			featured,
			category,
			tag,
			search,
			minReadTime,
			maxReadTime,
		} = req.query;

		// Build query
		const query = {};

		if (status) {
			query.status = status;
		}

		// Search functionality with regex for partial matches
		if (search && search.trim() !== '') {
			const searchRegex = new RegExp(`^${search}|\\s${search}`, 'i');

			query.$or = [
				{ title: { $regex: searchRegex } },
				{ summary: { $regex: searchRegex } },
				{ content: { $regex: searchRegex } },
				{ categories: { $regex: searchRegex } },
				{ tags: { $regex: searchRegex } },
			];
		}

		// Category filter
		if (category) {
			const categoryArray = Array.isArray(category) ? category : [category];
			query.categories = { $in: categoryArray };
		}

		// Tag filter
		if (tag) {
			const tagArray = Array.isArray(tag) ? tag : [tag];
			query.tags = { $in: tagArray };
		}

		// Featured filter
		if (featured === 'true') {
			query.isFeatured = true;
		}
		if (minReadTime || maxReadTime) {
			query.readTime = {};
			if (minReadTime) query.readTime = { $gte: minReadTime };
			if (maxReadTime) query.readTime = { $lte: maxReadTime };
		}
		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Sort options
		const sortOptions = {};

		// Handle sort cases
		if (sort === 'popular') {
			sortOptions.viewCount = direction === 'asc' ? 1 : -1;
		} else if (sort === 'newest' || sort === 'createdAt') {
			sortOptions.createdAt = direction === 'asc' ? 1 : -1;
		} else if (sort === 'title') {
			sortOptions.title = direction === 'asc' ? 1 : -1;
		} else if (sort === 'readTime') {
			sortOptions.readTime = direction === 'asc' ? 1 : -1;
		} else if (sort) {
			// Handle any other field
			sortOptions[sort] = direction === 'asc' ? 1 : -1;
		} else {
			// Default sort by creation date, newest first
			sortOptions.createdAt = -1;
		}
		console.log(query);
		// Execute query with pagination
		const blogs = await Blog.find(query).sort(sortOptions).skip(skip).limit(Number(limit)).populate('author', 'name');

		// Get total count for pagination
		const total = await Blog.countDocuments(query);
		console.log(blogs);
		res.json({
			blogs,
			pagination: {
				totalPages: Math.ceil(total / Number(limit)),
				currentPage: Number(page),
				total,
			},
		});
	} catch (error) {
		console.error('Error fetching blogs:', error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
});

// @route GET /api/blogs/featured
// @desc Get featured blogs
// @access Public
router.get('/featured', async (req, res) => {
	try {
		const limit = Number.parseInt(req.query.limit) || 6;

		const blogs = await Blog.find({
			isFeatured: true,
			status: 'published',
		})
			.sort({ createdAt: -1 })
			.limit(limit)
			.populate('author', 'name');

		res.status(200).json({ success: true, blogs });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/blogs/categories
// @desc Get all unique blog categories
// @access Public
router.get('/categories', async (req, res) => {
	try {
		const categories = await Blog.distinct('categories');
		res.status(200).json({ success: true, categories });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/blogs/tags
// @desc Get all unique blog tags
// @access Public
router.get('/tags', async (req, res) => {
	try {
		const tags = await Blog.distinct('tags');
		res.status(200).json({ success: true, tags });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route GET /api/blogs/:id
// @desc Get a single blog by ID
// @access Public
router.get('/:id', async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id).populate('author', 'name');

		if (!blog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		// Increment view count
		blog.viewCount += 1;
		await blog.save();

		res.json(blog);
	} catch (error) {
		console.error('Error fetching blog:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route GET /api/blogs/slug/:slug
// @desc Get a single blog by slug
// @access Public
router.get('/slug/:slug', async (req, res) => {
	try {
		const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name');

		if (!blog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		// Increment view count
		blog.viewCount += 1;
		await blog.save();

		res.json(blog);
	} catch (error) {
		console.error('Error fetching blog:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route POST /api/blogs
// @desc Create a new blog
// @access Private (Admin and Moderator only)
router.post(
	'/',
	verifyUser,
	verifyRole('admin', 'moderator'),
	upload.fields([
		{ name: 'coverImage', maxCount: 1 },
		{ name: 'images', maxCount: 5 },
	]),
	async (req, res) => {
		try {
			// Parse form data using the transformNestedFields function
			const blogData = transformNestedFields(req.body);
			const { title, summary, content, categories, tags, status } = req.body;

			// Create new blog
			const blog = new Blog({
				title,
				summary,
				content,
				categories: categories ? JSON.parse(categories) : [],
				tags: tags ? JSON.parse(tags) : [],
				status: status || 'draft',
				author: req.user._id,
			});

			// Upload cover image to Cloudinary
			if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
				const coverImageFile = req.files.coverImage[0];
				const coverImageResult = await uploadImage(coverImageFile);
				blog.coverImage = coverImageResult;

				// Clean up uploaded file
				fs.unlinkSync(coverImageFile.path);
			}

			// Upload additional images to Cloudinary
			if (req.files && req.files.images && req.files.images.length > 0) {
				for (const file of req.files.images) {
					const result = await uploadImage(file);
					blog.images.push(result);

					// Clean up uploaded file
					fs.unlinkSync(file.path);
				}
			}

			// Save blog to database
			await blog.save();

			res.status(201).json({ success: true, blog });
		} catch (error) {
			console.error('Error creating blog:', error);

			// Clean up any uploaded files
			if (req.files) {
				Object.values(req.files).forEach((fileArray) => {
					fileArray.forEach((file) => {
						if (fs.existsSync(file.path)) {
							fs.unlinkSync(file.path);
						}
					});
				});
			}

			res.status(500).json({ success: false, message: error.message });
		}
	}
);

// @route PUT /api/blogs/:id
// @desc Update a blog
// @access Private (Admin and Moderator only)
router.put(
	'/:id',
	verifyUser,
	verifyRole('admin', 'moderator'),
	upload.fields([
		{ name: 'coverImage', maxCount: 1 },
		{ name: 'images', maxCount: 5 },
	]),
	async (req, res) => {
		try {
			const blog = await Blog.findById(req.params.id);

			if (!blog) {
				return res.status(404).json({ message: 'Blog not found' });
			}

			// Check if user is authorized to update this blog
			if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
				return res.status(403).json({ message: 'Not authorized to update this blog' });
			}

			// Parse form data using the transformNestedFields function
			const blogData = transformNestedFields(req.body);
			const { title, summary, content, categories, tags, status, deleteCoverImage, deleteImages } = req.body;

			// Use Object.assign for updating the blog with transformed data
			// But handle special fields separately
			const updateData = {
				...blogData,
				categories: categories ? JSON.parse(categories) : blog.categories,
				tags: tags ? JSON.parse(tags) : blog.tags,
			};

			// Update the blog with the new data
			Object.assign(blog, updateData);

			// Handle cover image deletion
			if (deleteCoverImage === 'true' && blog.coverImage) {
				blog.coverImage = null;
			}

			// Handle image deletion
			if (deleteImages) {
				const imagesToDelete = JSON.parse(deleteImages);
				blog.images = blog.images.filter((img) => !imagesToDelete.includes(img._id.toString()));
			}

			// Upload new cover image
			if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
				const coverImageFile = req.files.coverImage[0];
				const coverImageResult = await uploadImage(coverImageFile);
				blog.coverImage = coverImageResult;

				// Clean up uploaded file
				fs.unlinkSync(coverImageFile.path);
			}

			// Upload new additional images
			if (req.files && req.files.images && req.files.images.length > 0) {
				for (const file of req.files.images) {
					const result = await uploadImage(file);
					blog.images.push(result);

					// Clean up uploaded file
					fs.unlinkSync(file.path);
				}
			}

			// Save updated blog
			await blog.save();

			res.json({ success: true, blog });
		} catch (error) {
			console.error('Error updating blog:', error);

			// Clean up any uploaded files
			if (req.files) {
				Object.values(req.files).forEach((fileArray) => {
					fileArray.forEach((file) => {
						if (fs.existsSync(file.path)) {
							fs.unlinkSync(file.path);
						}
					});
				});
			}

			res.status(500).json({ message: 'Server Error', error: error.message });
		}
	}
);

// @route DELETE /api/blogs/:id
// @desc Delete blog
// @access Private (Admin and Moderator only)
router.delete('/:id', verifyUser, verifyRole('admin', 'moderator'), async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id);

		if (!blog) {
			return res.status(404).json({ success: false, message: 'Blog not found' });
		}

		// Check if user is authorized to delete this blog
		if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to delete this blog' });
		}

		// Delete blog from database
		await Blog.findByIdAndDelete(req.params.id);

		res.status(200).json({ success: true, message: 'Blog deleted successfully' });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route PATCH /api/blogs/:id/status
// @desc Update blog status
// @access Private (Admin and Moderator only)
router.patch('/:id/status', verifyUser, verifyRole('admin', 'moderator'), async (req, res) => {
	try {
		const { status } = req.body;

		if (!['draft', 'published', 'archived'].includes(status)) {
			return res.status(400).json({ success: false, message: 'Invalid status value' });
		}

		const blog = await Blog.findById(req.params.id);

		if (!blog) {
			return res.status(404).json({ success: false, message: 'Blog not found' });
		}

		// Check if user is authorized to update this blog
		if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to update this blog' });
		}

		blog.status = status;
		await blog.save();

		res.status(200).json({ success: true, blog });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route PATCH /api/blogs/:id/feature
// @desc Toggle featured status
// @access Private (Admin only)
router.patch('/:id/featured', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id);

		if (!blog) {
			return res.status(404).json({ success: false, message: 'Blog not found' });
		}

		blog.isFeatured = !blog.isFeatured;
		await blog.save();

		res.status(200).json({ success: true, blog });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// @route DELETE /api/blogs/:blogId/images/:imageId
// @desc Delete an image from a blog
// @access Private (Admin and Moderator only)
router.delete('/:blogId/images/:imageId', verifyUser, verifyRole('admin', 'moderator'), async (req, res) => {
	try {
		const { blogId, imageId } = req.params;

		const blog = await Blog.findById(blogId);

		if (!blog) {
			return res.status(404).json({ success: false, message: 'Blog not found' });
		}

		// Check if user is authorized to update this blog
		if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to update this blog' });
		}

		// Find the image by its _id
		const imageIndex = blog.images.findIndex((img) => img._id.toString() === imageId);

		if (imageIndex === -1) {
			return res.status(404).json({ success: false, message: 'Image not found' });
		}

		// Remove the image from the images array
		blog.images.splice(imageIndex, 1);

		// Save the updated blog
		await blog.save();

		res.status(200).json({ success: true, message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Error deleting image:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
