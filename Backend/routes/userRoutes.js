const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyRole, verifyUser } = require('../middlewares/authMiddleware');
const { generateAccessToken, generateRefreshToken, calculateRefreshTokenExpiry } = require('../utils/authUtils');
const router = express.Router();

// Helper function to handle token generation and response
const createTokensAndRespond = async (user, userAgent, res) => {
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
			role: user.role,
		},
		accessToken,
		refreshToken,
		refreshTokenExpiry,
	});
};

// @route POST /api/users/register
// @desc register a new user
// @access Public
router.post('/register', async (req, res) => {
	const { name, email, password, phone } = req.body;
	try {
		// Registration Logic
		let user = await User.findOne({ email });
		if (user) return res.status(400).json({ message: 'User already exists' });

		user = new User({ name, email, password, phone });
		await user.save();

		// Create tokens and respond
		await createTokensAndRespond(user, req.headers['user-agent'], res);
	} catch (error) {
		console.log(error);
		res.status(500).send('Server Error');
	}
});

// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		// Find the user by email
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

		const isMatch = await user.comparePassword(password);
		if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

		// Create tokens and respond
		await createTokensAndRespond(user, req.headers['user-agent'], res);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server Error' });
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

// Keep the rest of your routes as they are...
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

// @route GET /api/users
// @desc Get all users with filtering, sorting, search and pagination
// @access Private (Admin only)
router.get('/', verifyUser, verifyRole('admin'), async (req, res) => {
	try {
		const { page = 1, limit = 10, sort = 'createdAt', direction = 'desc', role, search } = req.query;

		// Build query
		const query = {};

		// Role filter
		if (role && role !== 'all') {
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
			.select('-password -refreshTokens')
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
			'-password -refreshTokens'
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

		const user = await User.findByIdAndDelete(req.params.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error);
		res.status(500).json({ message: 'Server Error' });
	}
});

module.exports = router;
