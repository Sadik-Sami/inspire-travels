const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const { uploadUserImage, deleteImage } = require('../config/cloudinary');
const upload = require('../middlewares/uploadMiddleware');

// @desc    Get all customers with filtering, sorting, and pagination
// @route   GET /api/customers
// @access  Private (Admin, Employee)
router.get('/', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { page = 1, limit = 10, search = '', sort = 'createdAt', direction = 'desc' } = req.query;

		// Build search query
		const searchQuery = {};
		if (search) {
			searchQuery.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ phone: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			];
		}

		// Build sort object
		const sortObj = {};
		sortObj[sort] = direction === 'desc' ? -1 : 1;

		// Calculate pagination
		const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

		// Execute queries
		const [customers, total] = await Promise.all([
			Customer.find(searchQuery)
				.populate('createdBy', 'name email')
				.populate('updatedBy', 'name email')
				.sort(sortObj)
				.skip(skip)
				.limit(Number.parseInt(limit)),
			Customer.countDocuments(searchQuery),
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(total / Number.parseInt(limit));

		res.json({
			success: true,
			customers,
			pagination: {
				currentPage: Number.parseInt(page),
				totalPages,
				total,
				hasNext: Number.parseInt(page) < totalPages,
				hasPrev: Number.parseInt(page) > 1,
			},
		});
	} catch (error) {
		console.error('Error fetching customers:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch customers',
			error: error.message,
		});
	}
});

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private (Admin, Employee)
router.get('/:id', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const customer = await Customer.findById(req.params.id)
			.populate('createdBy', 'name email')
			.populate('updatedBy', 'name email');

		if (!customer) {
			return res.status(404).json({
				success: false,
				message: 'Customer not found',
			});
		}

		res.json({
			success: true,
			customer,
		});
	} catch (error) {
		console.error('Error fetching customer:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch customer',
			error: error.message,
		});
	}
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (Admin, Employee)
router.post('/', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { name, phone, email, address, passportNumber, notes } = req.body;

		// Check if phone number already exists
		const existingCustomer = await Customer.findOne({ phone });
		if (existingCustomer) {
			return res.status(400).json({
				success: false,
				message: 'A customer with this phone number already exists',
			});
		}

		// Check if email exists (if provided)
		if (email) {
			const existingEmail = await Customer.findOne({ email });
			if (existingEmail) {
				return res.status(400).json({
					success: false,
					message: 'A customer with this email already exists',
				});
			}
		}

		// Create new customer
		const customer = new Customer({
			name,
			phone,
			email,
			address,
			passportNumber,
			notes,
			createdBy: req.user._id,
		});

		await customer.save();

		// Populate the created customer
		await customer.populate('createdBy', 'name email');

		res.status(201).json({
			success: true,
			message: 'Customer created successfully',
			customer,
		});
	} catch (error) {
		console.error('Error creating customer:', error);

		// Handle validation errors
		if (error.name === 'ValidationError') {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors,
			});
		}

		// Handle duplicate key error
		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			return res.status(400).json({
				success: false,
				message: `A customer with this ${field} already exists`,
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to create customer',
			error: error.message,
		});
	}
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin, Employee)
router.put('/:id', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { name, phone, email, address, passportNumber, notes } = req.body;

		const customer = await Customer.findById(req.params.id);
		if (!customer) {
			return res.status(404).json({
				success: false,
				message: 'Customer not found',
			});
		}

		// Check if phone number is being changed and if it already exists
		if (phone && phone !== customer.phone) {
			const existingCustomer = await Customer.findOne({ phone });
			if (existingCustomer) {
				return res.status(400).json({
					success: false,
					message: 'A customer with this phone number already exists',
				});
			}
		}

		// Check if email is being changed and if it already exists
		if (email && email !== customer.email) {
			const existingEmail = await Customer.findOne({ email });
			if (existingEmail) {
				return res.status(400).json({
					success: false,
					message: 'A customer with this email already exists',
				});
			}
		}

		// Update customer fields
		customer.name = name || customer.name;
		customer.phone = phone || customer.phone;
		customer.email = email || customer.email;
		customer.address = address || customer.address;
		customer.passportNumber = passportNumber || customer.passportNumber;
		customer.notes = notes || customer.notes;
		customer.updatedBy = req.user._id;

		await customer.save();

		// Populate the updated customer
		await customer.populate(['createdBy', 'updatedBy'], 'name email');

		res.json({
			success: true,
			message: 'Customer updated successfully',
			customer,
		});
	} catch (error) {
		console.error('Error updating customer:', error);

		// Handle validation errors
		if (error.name === 'ValidationError') {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors,
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to update customer',
			error: error.message,
		});
	}
});

// @desc    Upload customer profile image
// @route   POST /api/customers/:id/image
// @access  Private (Admin, Employee)
router.post('/:id/image', verifyUser, verifyRole('admin', 'employee'), upload.single('image'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'No image file provided',
			});
		}

		const customer = await Customer.findById(req.params.id);
		if (!customer) {
			return res.status(404).json({
				success: false,
				message: 'Customer not found',
			});
		}

		// Upload image to Cloudinary using the buffer
		const result = await uploadUserImage(req.file);

		// Delete old image if exists
		if (customer.profileImage?.publicId) {
			try {
				await deleteImage(customer.profileImage.publicId);
			} catch (deleteError) {
				console.error('Error deleting old image:', deleteError);
				// Continue with update even if old image deletion fails
			}
		}

		// Update customer with new image
		customer.profileImage = {
			url: result.url,
			publicId: result.publicId,
		};
		customer.updatedBy = req.user._id;

		await customer.save();

		res.json({
			success: true,
			message: 'Profile image updated successfully',
			profileImage: customer.profileImage,
		});
	} catch (error) {
		console.error('Error uploading customer image:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to upload image',
			error: error.message,
		});
	}
});

// @desc    Delete customer profile image
// @route   DELETE /api/customers/:id/image
// @access  Private (Admin, Employee)
router.delete('/:id/image', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const customer = await Customer.findById(req.params.id);
		if (!customer) {
			return res.status(404).json({
				success: false,
				message: 'Customer not found',
			});
		}

		if (!customer.profileImage?.publicId) {
			return res.status(400).json({
				success: false,
				message: 'No profile image to delete',
			});
		}

		// Delete image from Cloudinary
		await deleteImage(customer.profileImage.publicId);

		// Remove image from customer
		customer.profileImage = undefined;
		customer.updatedBy = req.user._id;

		await customer.save();

		res.json({
			success: true,
			message: 'Profile image deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting customer image:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete image',
			error: error.message,
		});
	}
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Employee)
router.delete('/:id', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const customer = await Customer.findById(req.params.id);
		if (!customer) {
			return res.status(404).json({
				success: false,
				message: 'Customer not found',
			});
		}

		// Delete profile image from Cloudinary if exists
		if (customer.profileImage?.publicId) {
			try {
				await deleteImage(customer.profileImage.publicId);
			} catch (imageError) {
				console.error('Error deleting customer image:', imageError);
				// Continue with customer deletion even if image deletion fails
			}
		}

		// Delete customer
		await Customer.findByIdAndDelete(req.params.id);

		res.json({
			success: true,
			message: 'Customer deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting customer:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete customer',
			error: error.message,
		});
	}
});

// @desc    Get customer statistics
// @route   GET /api/customers/stats/overview
// @access  Private (Admin, Employee)
router.get('/stats/overview', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const [totalCustomers, customersThisMonth, customersWithEmail, customersWithPassport] = await Promise.all([
			Customer.countDocuments(),
			Customer.countDocuments({
				createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
			}),
			Customer.countDocuments({ email: { $exists: true, $ne: '' } }),
			Customer.countDocuments({ passportNumber: { $exists: true, $ne: '' } }),
		]);

		res.json({
			success: true,
			stats: {
				totalCustomers,
				customersThisMonth,
				customersWithEmail,
				customersWithPassport,
				emailPercentage: totalCustomers > 0 ? Math.round((customersWithEmail / totalCustomers) * 100) : 0,
				passportPercentage: totalCustomers > 0 ? Math.round((customersWithPassport / totalCustomers) * 100) : 0,
			},
		});
	} catch (error) {
		console.error('Error fetching customer stats:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch customer statistics',
			error: error.message,
		});
	}
});

module.exports = router;
