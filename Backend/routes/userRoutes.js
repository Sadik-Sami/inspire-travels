const express = require('express');
const User = require('../models/User');
const { verifyRole, verifyUser, verifyFirebaseToken, verifyRefreshToken } = require('../middlewares/authMiddleware');
const { generateAccessToken, generateTokenId, generateRefreshToken } = require('../utils/authUtils');
const { uploadUserImage, deleteImage } = require('../config/cloudinary');
const upload = require('../middlewares/uploadMiddleware');
const admin = require('../config/firebase-admin');
const router = express.Router();

// Helper function to handle dual token generation and response
const createTokenAndRespond = async (user, res) => {
	try {
		// Generate short-lived access token (1 hour)
		const accessToken = generateAccessToken(user._id, user.role);

		// Generate refresh token ID and token (7 days)
		const refreshTokenId = generateTokenId();
		const refreshToken = generateRefreshToken(user._id, refreshTokenId);

		// Store refresh token in database
		user.refreshTokens.push({
			tokenId: refreshTokenId,
			token: refreshToken,
		});
		await user.save();

		// Cookie options for refresh token
		const refreshCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			path: '/',
		};

		// Send response with refresh token in cookie and access token in response
		res.cookie('refreshToken', refreshToken, refreshCookieOptions).json({
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
			accessToken, // Short-lived token for localStorage
		});
	} catch (error) {
		throw error;
	}
};

// @route POST /api/users/refresh-token
// @desc Refresh access token using refresh token from cookie
// @access Public (but requires valid refresh token)
router.post('/refresh-token', verifyRefreshToken, async (req, res) => {
	try {
		const { user, refreshTokenData } = req;
		const { storedToken } = refreshTokenData;

		// Mark current token as used (for token rotation)
		storedToken.isUsed = true;

		// Generate new access token
		const newAccessToken = generateAccessToken(user._id, user.role);

		// Generate new refresh token (token rotation)
		const newRefreshTokenId = generateTokenId();
		const newRefreshToken = generateRefreshToken(user._id, newRefreshTokenId);

		// Store new refresh token
		user.refreshTokens.push({
			tokenId: newRefreshTokenId,
			token: newRefreshToken,
		});

		await user.save();

		// Set new refresh token cookie
		const refreshCookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			maxAge: 6 * 60 * 60 * 1000, // 6 hours
			path: '/',
		};

		res.cookie('refreshToken', newRefreshToken, refreshCookieOptions).json({
			success: true,
			accessToken: newAccessToken,
			message: 'Token refreshed successfully',
		});
	} catch (error) {
		console.error('Refresh token error:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route POST /api/users/create-user
// @desc Create a new user using Firebase Admin SDK
// @access Private (Admin only)
router.post('/create-user', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { name, email, password, phone, address, passportNumber, role } = req.body;

		// Validate required fields
		if (!name || !email || !password || !phone) {
			return res.status(400).json({
				success: false,
				message: 'Name, email, password, and phone are required fields',
			});
		}

		// Validate role
		const validRoles = ['customer', 'admin', 'moderator', 'employee'];
		if (!validRoles.includes(role)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid role specified',
			});
		}

		// Check if user already exists in our database
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User with this email already exists',
			});
		}

		// Create user in Firebase
		let firebaseUser;
		try {
			firebaseUser = await admin.auth().createUser({
				email: email.toLowerCase(),
				password: password,
				displayName: name,
				emailVerified: true,
			});
		} catch (firebaseError) {
			console.error('Firebase user creation error:', firebaseError);

			// Handle specific Firebase errors
			if (firebaseError.code === 'auth/email-already-exists') {
				return res.status(400).json({
					success: false,
					message: 'A user with this email already exists in Firebase',
				});
			} else if (firebaseError.code === 'auth/invalid-email') {
				return res.status(400).json({
					success: false,
					message: 'Invalid email address format',
				});
			} else if (firebaseError.code === 'auth/weak-password') {
				return res.status(400).json({
					success: false,
					message: 'Password is too weak. Please use a stronger password',
				});
			}

			return res.status(500).json({
				success: false,
				message: 'Failed to create user in Firebase',
				error: firebaseError.message,
			});
		}

		// Create user in our database
		try {
			const newUser = new User({
				name,
				email: email.toLowerCase(),
				phone,
				address: address || '',
				passportNumber: passportNumber || '',
				role,
				firebaseUid: firebaseUser.uid,
			});

			await newUser.save();

			// Return success response with user data (excluding sensitive info)
			res.status(201).json({
				success: true,
				message: 'User created successfully',
				user: {
					_id: newUser._id,
					name: newUser.name,
					email: newUser.email,
					phone: newUser.phone,
					address: newUser.address,
					passportNumber: newUser.passportNumber,
					role: newUser.role,
					createdAt: newUser.createdAt,
				},
			});
		} catch (dbError) {
			console.error('Database user creation error:', dbError);

			// If database creation fails, clean up Firebase user
			try {
				await admin.auth().deleteUser(firebaseUser.uid);
			} catch (cleanupError) {
				console.error('Failed to cleanup Firebase user:', cleanupError);
			}

			return res.status(500).json({
				success: false,
				message: 'Failed to create user in database',
				error: dbError.message,
			});
		}
	} catch (error) {
		console.error('User creation error:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route POST /api/users/firebase-auth
// @desc Authenticate user with Firebase token and create/login user
// @access Public
router.post('/firebase-auth', verifyFirebaseToken, async (req, res) => {
	try {
		const { name, phone, address } = req.body;
		const { uid, email } = req.firebaseUser;

		let user = await User.findOne({ firebaseUid: uid });

		if (user) {
			const updateData = {};
			if (name) updateData.name = name;
			if (phone) updateData.phone = phone;
			if (address) updateData.address = address;

			if (Object.keys(updateData).length > 0) {
				user = await User.findOneAndUpdate({ firebaseUid: uid }, { $set: updateData }, { new: true });
				console.log(`Updated user ${uid}:`, updateData);
			} else {
				console.log(`No fields to update for user ${user._id}`);
			}
		} else {
			user = await User.create({
				name: name || req.firebaseUser.name || '',
				email,
				phone: phone || '',
				address: address || '',
				firebaseUid: uid,
				role: 'customer',
			});
			console.log(`Created new user ${uid}:`, user);
		}

		// Generate tokens and respond
		await createTokenAndRespond(user, res);
	} catch (error) {
		console.error('Firebase auth error:', error);
		if (error.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'A user with this email already exists.',
			});
		}
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
});

// @route POST /api/users/logout
// @desc Logout user and clear cookies
// @access Private
router.post('/logout', verifyUser, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (user) {
			user.refreshTokens = [];
			await user.save();
		}

		// Clear both cookies
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			path: '/',
		};

		res.clearCookie('refreshToken', cookieOptions).json({ success: true, message: 'Logged out successfully' });
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
		success: true,
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
		const users = await User.find(query).select('-firebaseUid').sort(sortOptions).skip(skip).limit(Number(limit));

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
		const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-firebaseUid');

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

		// Delete user from Firebase if firebaseUid exists
		if (user.firebaseUid) {
			try {
				await admin.auth().deleteUser(user.firebaseUid);
			} catch (firebaseError) {
				console.error('Error deleting Firebase user:', firebaseError);
				// Continue with database deletion even if Firebase deletion fails
			}
		}

		// Delete profile image from Cloudinary if it exists
		if (user.profileImage && user.profileImage.publicId) {
			try {
				await deleteImage(user.profileImage.publicId);
			} catch (error) {
				console.error('Error deleting user profile image:', error);
			}
		}

		// Delete user from database
		await User.findByIdAndDelete(req.params.id);

		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

module.exports = router;
