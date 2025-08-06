// const express = require('express');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const { verifyRole, verifyUser, verifyFirebaseToken } = require('../middlewares/authMiddleware');
// const { generateAccessToken, generateRefreshToken, calculateRefreshTokenExpiry } = require('../utils/authUtils');
// const { uploadUserImage, deleteImage } = require('../config/cloudinary');
// const upload = require('../middlewares/uploadMiddleware');
// const router = express.Router();

// // Helper function to handle token generation and response
// const createTokensAndRespond = async (user, userAgent, res) => {
// 	// Generate tokens
// 	const accessToken = generateAccessToken(user._id, user.role);
// 	const refreshToken = generateRefreshToken();
// 	const refreshTokenExpiry = calculateRefreshTokenExpiry();

// 	// Store refresh token in database
// 	user.refreshTokens.push({
// 		token: refreshToken,
// 		expiresAt: refreshTokenExpiry,
// 		userAgent: userAgent || 'unknown',
// 	});
// 	await user.save();

// 	// Send response with both tokens and user data
// 	res.json({
// 		success: true,
// 		user: {
// 			_id: user._id,
// 			name: user.name,
// 			email: user.email,
// 			phone: user.phone,
// 			address: user.address,
// 			passportNumber: user.passportNumber,
// 			profileImage: user.profileImage,
// 			role: user.role,
// 		},
// 		accessToken,
// 		refreshToken,
// 		refreshTokenExpiry,
// 	});
// };

// // @route POST /api/users/firebase-auth
// // @desc Authenticate user with Firebase token and create/login user
// // @access Public
// router.post('/firebase-auth', verifyFirebaseToken, async (req, res) => {
// 	try {
// 		const { name, phone, address } = req.body;
// 		const { uid, email } = req.firebaseUser;

// 		// Check if user exists
// 		let user = await User.findOne({ firebaseUid: uid });

// 		if (!user) {
// 			// Create new user
// 			user = new User({
// 				name: req.firebaseUser.displayName || name || '',
// 				email,
// 				phone: phone || '',
// 				address: address || '',
// 				firebaseUid: uid,
// 			});
// 			await user.save();
// 		} else {
// 			// Update user info if provided
// 			if (name) user.name = name;
// 			if (phone) user.phone = phone;
// 			if (address) user.address = address;
// 			await user.save();
// 		}

// 		// Create tokens and respond
// 		await createTokensAndRespond(user, req.headers['user-agent'], res);
// 	} catch (error) {
// 		console.error('Firebase auth error:', error);
// 		res.status(500).json({
// 			success: false,
// 			message: 'Server Error',
// 			error: error.message,
// 		});
// 	}
// });

// // @route POST /api/users/refresh-token
// // @desc Refresh access token using refresh token
// // @access Public (but requires refresh token)
// router.post('/refresh-token', async (req, res) => {
// 	try {
// 		// Get refresh token from request body
// 		const { refreshToken } = req.body;

// 		if (!refreshToken) {
// 			return res.status(401).json({ message: 'Refresh token not found' });
// 		}

// 		// Find user with this refresh token
// 		const user = await User.findOne({
// 			'refreshTokens.token': refreshToken,
// 			'refreshTokens.expiresAt': { $gt: new Date() },
// 		});

// 		if (!user) {
// 			return res.status(401).json({ message: 'Invalid or expired refresh token' });
// 		}

// 		// Generate new access token
// 		const accessToken = generateAccessToken(user._id, user.role);

// 		// Send response with new access token
// 		res.json({
// 			success: true,
// 			accessToken,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// // @route POST /api/users/logout
// // @desc Logout user and invalidate refresh token
// // @access Private
// router.post('/logout', verifyUser, async (req, res) => {
// 	try {
// 		const { refreshToken } = req.body;

// 		if (refreshToken) {
// 			// Remove this refresh token from user's tokens
// 			await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { token: refreshToken } } });
// 		}

// 		res.json({ success: true, message: 'Logged out successfully' });
// 	} catch (error) {
// 		console.log(error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// // @route POST /api/users/logout-all
// // @desc Logout from all devices
// // @access Private
// router.post('/logout-all', verifyUser, async (req, res) => {
// 	try {
// 		// Remove all refresh tokens for this user
// 		await User.updateOne({ _id: req.user._id }, { $set: { refreshTokens: [] } });

// 		res.json({ success: true, message: 'Logged out from all devices' });
// 	} catch (error) {
// 		console.log(error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// // @route GET /api/users/profile
// // @desc Get the logged-in users profile
// // @access Private
// router.get('/profile', verifyUser, async (req, res) => {
// 	res.json(req.user);
// });

// // @route GET /api/users/role
// // @desc Get the logged-in users role
// // @access Private
// router.get('/role', verifyUser, (req, res) => {
// 	res.json({
// 		message: 'User authenticated',
// 		user: req.user,
// 	});
// });

// // @route PUT /api/users/profile
// // @desc Update user profile
// // @access Private
// router.put('/profile', verifyUser, async (req, res) => {
// 	try {
// 		const { name, phone, address, passportNumber } = req.body;

// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			return res.status(404).json({ message: 'User not found' });
// 		}

// 		// Update fields
// 		if (name) user.name = name;
// 		if (phone) user.phone = phone;
// 		if (address) user.address = address;
// 		if (passportNumber !== undefined) user.passportNumber = passportNumber;

// 		await user.save();

// 		res.json({
// 			success: true,
// 			user: {
// 				_id: user._id,
// 				name: user.name,
// 				email: user.email,
// 				phone: user.phone,
// 				address: user.address,
// 				passportNumber: user.passportNumber,
// 				profileImage: user.profileImage,
// 				role: user.role,
// 			},
// 		});
// 	} catch (error) {
// 		console.error('Profile update error:', error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// // @route POST /api/users/upload-profile-image
// // @desc Upload profile image to Cloudinary
// // @access Private
// router.post('/upload-profile-image', verifyUser, upload.single('profileImage'), async (req, res) => {
// 	try {
// 		if (!req.file) {
// 			return res.status(400).json({ message: 'No image file provided' });
// 		}

// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			return res.status(404).json({ message: 'User not found' });
// 		}

// 		// Delete old image if it exists
// 		if (user.profileImage && user.profileImage.publicId) {
// 			try {
// 				await deleteImage(user.profileImage.publicId);
// 			} catch (error) {
// 				console.error('Error deleting old profile image:', error);
// 				// Continue with upload even if deletion fails
// 			}
// 		}

// 		// Upload new image to Cloudinary using the user-specific function
// 		const uploadResult = await uploadUserImage(req.file);

// 		// Update user profile image
// 		user.profileImage = {
// 			url: uploadResult.url,
// 			publicId: uploadResult.publicId,
// 		};
// 		await user.save();

// 		res.json({
// 			success: true,
// 			profileImage: user.profileImage,
// 			message: 'Profile image updated successfully',
// 		});
// 	} catch (error) {
// 		console.error('Profile image upload error:', error);
// 		res.status(500).json({
// 			success: false,
// 			message: 'Failed to upload profile image',
// 			error: error.message,
// 		});
// 	}
// });

// // @route DELETE /api/users/delete-profile-image
// // @desc Delete profile image
// // @access Private
// router.delete('/delete-profile-image', verifyUser, async (req, res) => {
// 	try {
// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			return res.status(404).json({ message: 'User not found' });
// 		}

// 		// Delete image from Cloudinary if it exists
// 		if (user.profileImage && user.profileImage.publicId) {
// 			try {
// 				await deleteImage(user.profileImage.publicId);
// 			} catch (error) {
// 				console.error('Error deleting profile image from Cloudinary:', error);
// 			}
// 		}

// 		// Clear profile image from user
// 		user.profileImage = {
// 			url: '',
// 			publicId: '',
// 		};
// 		await user.save();

// 		res.json({
// 			success: true,
// 			message: 'Profile image deleted successfully',
// 		});
// 	} catch (error) {
// 		console.error('Profile image deletion error:', error);
// 		res.status(500).json({
// 			success: false,
// 			message: 'Failed to delete profile image',
// 			error: error.message,
// 		});
// 	}
// });

// // @route GET /api/users
// // @desc Get all users with filtering, sorting, search and pagination
// // @access Private (Admin only)
// router.get('/', verifyUser, verifyRole('admin'), async (req, res) => {
// 	try {
// 		const { page = 1, limit = 10, sort = 'createdAt', direction = 'desc', role, search } = req.query;

// 		// Build query
// 		const query = {};

// 		// Role filter
// 		if (role && role !== 'all') {
// 			query.role = role;
// 		}

// 		// Search functionality
// 		if (search) {
// 			const searchRegex = new RegExp(search, 'i');
// 			query.$or = [
// 				{ name: { $regex: searchRegex } },
// 				{ email: { $regex: searchRegex } },
// 				{ phone: { $regex: searchRegex } },
// 			];
// 		}

// 		// Calculate pagination
// 		const skip = (Number(page) - 1) * Number(limit);

// 		// Sort options
// 		const sortOptions = {};
// 		sortOptions[sort] = direction === 'asc' ? 1 : -1;

// 		// Execute query with pagination
// 		const users = await User.find(query)
// 			.select('-refreshTokens -firebaseUid')
// 			.sort(sortOptions)
// 			.skip(skip)
// 			.limit(Number(limit));

// 		// Get total count for pagination
// 		const total = await User.countDocuments(query);

// 		res.json({
// 			users,
// 			pagination: {
// 				totalPages: Math.ceil(total / Number(limit)),
// 				currentPage: Number(page),
// 				total,
// 			},
// 		});
// 	} catch (error) {
// 		console.error('Error fetching users:', error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// // @route PATCH /api/users/:id/role
// // @desc Update user role
// // @access Private (Admin only)
// router.patch('/:id/role', verifyUser, verifyRole('admin'), async (req, res) => {
// 	try {
// 		const { role } = req.body;

// 		// Validate role
// 		if (!['customer', 'admin', 'moderator', 'employee'].includes(role)) {
// 			return res.status(400).json({ message: 'Invalid role' });
// 		}

// 		// Find user and update role
// 		const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
// 			'-refreshTokens -firebaseUid'
// 		);

// 		if (!user) {
// 			return res.status(404).json({ message: 'User not found' });
// 		}

// 		res.json(user);
// 	} catch (error) {
// 		console.error('Error updating user role:', error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// // @route DELETE /api/users/:id
// // @desc Delete a user
// // @access Private (Admin only)
// router.delete('/:id', verifyUser, verifyRole('admin'), async (req, res) => {
// 	try {
// 		// Prevent admin from deleting themselves
// 		if (req.params.id === req.user.id) {
// 			return res.status(400).json({ message: 'You cannot delete your own account' });
// 		}

// 		const user = await User.findById(req.params.id);
// 		if (!user) {
// 			return res.status(404).json({ message: 'User not found' });
// 		}

// 		// Delete profile image from Cloudinary if it exists
// 		if (user.profileImage && user.profileImage.publicId) {
// 			try {
// 				await deleteImage(user.profileImage.publicId);
// 			} catch (error) {
// 				console.error('Error deleting user profile image:', error);
// 			}
// 		}

// 		// Delete user
// 		await User.findByIdAndDelete(req.params.id);

// 		res.json({ message: 'User deleted successfully' });
// 	} catch (error) {
// 		console.error('Error deleting user:', error);
// 		res.status(500).json({ message: 'Server Error' });
// 	}
// });

// module.exports = router;

const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyRole, verifyUser, verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { generateAccessToken, generateRefreshToken, calculateRefreshTokenExpiry } = require('../utils/authUtils');
const { uploadUserImage, deleteImage } = require('../config/cloudinary');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

// Helper function to handle token generation and response with retry logic
const createTokensAndRespond = async (user, userAgent, res, retryCount = 0) => {
	try {
		// Generate tokens
		const accessToken = generateAccessToken(user._id, user.role);
		const refreshToken = generateRefreshToken();
		const refreshTokenExpiry = calculateRefreshTokenExpiry();

		// Store refresh token in database
		user.refreshTokens.push({
			token: refreshToken,
			expiresAt: refreshTokenExpiry,
			userAgent: userAgent || 'unknown',
		});

		await user.save();

		// Send response with both tokens and user data
		res.json({
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				address: user.address,
				passportNumber: user.passportNumber,
				profileImage: user.profileImage,
				role: user.role,
			},
			accessToken,
			refreshToken,
			refreshTokenExpiry,
		});
	} catch (error) {
		if (error.name === 'VersionError' && retryCount < 3) {
			// Retry with fresh user data
			const freshUser = await User.findById(user._id);
			return createTokensAndRespond(freshUser, userAgent, res, retryCount + 1);
		}
		throw error;
	}
};

// @route POST /api/users/firebase-auth
// @desc Authenticate user with Firebase token and create/login user
// @access Public
router.post('/firebase-auth', verifyFirebaseToken, async (req, res) => {
	try {
		const { name, phone, address } = req.body;
		const { uid, email } = req.firebaseUser;

		// Check if user exists
		let user = await User.findOne({ firebaseUid: uid });

		if (!user) {
			// Create new user
			user = new User({
				name: name || req.firebaseUser.name || '',
				email,
				phone: phone || '',
				address: address || '',
				firebaseUid: uid,
			});
			await user.save();
		} else {
			// Update user info if provided
			if (name) user.name = name;
			if (phone) user.phone = phone;
			if (address) user.address = address;
			await user.save();
		}

		// Create tokens and respond
		await createTokensAndRespond(user, req.headers['user-agent'], res);
	} catch (error) {
		console.error('Firebase auth error:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route POST /api/users/refresh-token
// @desc Refresh access token using refresh token
// @access Public (but requires refresh token)
router.post('/refresh-token', async (req, res) => {
	try {
		// Get refresh token from request body
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({ message: 'Refresh token not found' });
		}

		// Find user with this refresh token
		const user = await User.findOne({
			'refreshTokens.token': refreshToken,
			'refreshTokens.expiresAt': { $gt: new Date() },
		});

		if (!user) {
			return res.status(401).json({ message: 'Invalid or expired refresh token' });
		}

		// Generate new access token
		const accessToken = generateAccessToken(user._id, user.role);

		// Send response with new access token
		res.json({
			success: true,
			accessToken,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route POST /api/users/logout
// @desc Logout user and invalidate refresh token
// @access Private
router.post('/logout', verifyUser, async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (refreshToken) {
			// Remove this refresh token from user's tokens
			await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { token: refreshToken } } });
		}

		res.json({ success: true, message: 'Logged out successfully' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route POST /api/users/logout-all
// @desc Logout from all devices
// @access Private
router.post('/logout-all', verifyUser, async (req, res) => {
	try {
		// Remove all refresh tokens for this user
		await User.updateOne({ _id: req.user._id }, { $set: { refreshTokens: [] } });

		res.json({ success: true, message: 'Logged out from all devices' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route GET /api/users/profile
// @desc Get the logged-in users profile
// @access Private
router.get('/profile', verifyUser, async (req, res) => {
	res.json(req.user);
});

// @route GET /api/users/role
// @desc Get the logged-in users role
// @access Private
router.get('/role', verifyUser, (req, res) => {
	res.json({
		message: 'User authenticated',
		user: req.user,
	});
});

// @route PUT /api/users/profile
// @desc Update user profile
// @access Private
router.put('/profile', verifyUser, async (req, res) => {
	try {
		const { name, phone, address, passportNumber } = req.body;

		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Update fields
		if (name) user.name = name;
		if (phone) user.phone = phone;
		if (address) user.address = address;
		if (passportNumber !== undefined) user.passportNumber = passportNumber;

		await user.save();

		res.json({
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				address: user.address,
				passportNumber: user.passportNumber,
				profileImage: user.profileImage,
				role: user.role,
			},
		});
	} catch (error) {
		console.error('Profile update error:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route POST /api/users/upload-profile-image
// @desc Upload profile image to Cloudinary
// @access Private
router.post('/upload-profile-image', verifyUser, upload.single('profileImage'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No image file provided' });
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Delete old image if it exists
		if (user.profileImage && user.profileImage.publicId) {
			try {
				await deleteImage(user.profileImage.publicId);
			} catch (error) {
				console.error('Error deleting old profile image:', error);
				// Continue with upload even if deletion fails
			}
		}

		// Upload new image to Cloudinary using the user-specific function
		const uploadResult = await uploadUserImage(req.file);

		// Update user profile image
		user.profileImage = {
			url: uploadResult.url,
			publicId: uploadResult.publicId,
		};
		await user.save();

		res.json({
			success: true,
			profileImage: user.profileImage,
			message: 'Profile image updated successfully',
		});
	} catch (error) {
		console.error('Profile image upload error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to upload profile image',
			error: error.message,
		});
	}
});

// @route DELETE /api/users/delete-profile-image
// @desc Delete profile image
// @access Private
router.delete('/delete-profile-image', verifyUser, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Delete image from Cloudinary if it exists
		if (user.profileImage && user.profileImage.publicId) {
			try {
				await deleteImage(user.profileImage.publicId);
			} catch (error) {
				console.error('Error deleting profile image from Cloudinary:', error);
			}
		}

		// Clear profile image from user
		user.profileImage = {
			url: '',
			publicId: '',
		};
		await user.save();

		res.json({
			success: true,
			message: 'Profile image deleted successfully',
		});
	} catch (error) {
		console.error('Profile image deletion error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete profile image',
			error: error.message,
		});
	}
});

// @route GET /api/users
// @desc Get all users with filtering, sorting, search and pagination
// @access Private (Admin only)
router.get('/', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { page = 1, limit = 10, sort = 'createdAt', direction = 'desc', role, search, staffOnly } = req.query;

		// Build query
		const query = {};

		// Role filter
		if (staffOnly === 'true') {
			// Filter for staff roles only (admin, moderator, employee)
			query.role = { $in: ['admin', 'moderator', 'employee'] };
		} else if (role && role !== 'all') {
			query.role = role;
		}

		// Search functionality
		if (search) {
			const searchRegex = new RegExp(search, 'i');
			query.$or = [
				{ name: { $regex: searchRegex } },
				{ email: { $regex: searchRegex } },
				{ phone: { $regex: searchRegex } },
			];
		}

		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Sort options
		const sortOptions = {};
		sortOptions[sort] = direction === 'asc' ? 1 : -1;

		// Execute query with pagination
		const users = await User.find(query)
			.select('-refreshTokens -firebaseUid')
			.sort(sortOptions)
			.skip(skip)
			.limit(Number(limit));

		// Get total count for pagination
		const total = await User.countDocuments(query);

		res.json({
			users,
			pagination: {
				totalPages: Math.ceil(total / Number(limit)),
				currentPage: Number(page),
				total,
			},
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route PATCH /api/users/:id/role
// @desc Update user role
// @access Private (Admin only)
router.patch('/:id/role', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { role } = req.body;

		// Validate role
		if (!['customer', 'admin', 'moderator', 'employee'].includes(role)) {
			return res.status(400).json({ message: 'Invalid role' });
		}

		// Find user and update role
		const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
			'-refreshTokens -firebaseUid'
		);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		console.error('Error updating user role:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// @route DELETE /api/users/:id
// @desc Delete a user
// @access Private (Admin only)
router.delete('/:id', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		// Prevent admin from deleting themselves
		if (req.params.id === req.user.id) {
			return res.status(400).json({ message: 'You cannot delete your own account' });
		}

		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Delete profile image from Cloudinary if it exists
		if (user.profileImage && user.profileImage.publicId) {
			try {
				await deleteImage(user.profileImage.publicId);
			} catch (error) {
				console.error('Error deleting user profile image:', error);
			}
		}

		// Delete user
		await User.findByIdAndDelete(req.params.id);

		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

module.exports = router;
