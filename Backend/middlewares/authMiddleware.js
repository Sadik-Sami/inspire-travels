const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase-admin');

// Verify Firebase token middleware
const verifyFirebaseToken = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'No Firebase token provided' });
		}

		const idToken = authHeader.split(' ')[1];

		// Verify the Firebase ID token
		const decodedToken = await admin.auth().verifyIdToken(idToken);

		req.firebaseUser = {
			uid: decodedToken.uid,
			email: decodedToken.email,
			name: decodedToken.name || decodedToken.display_name,
			emailVerified: decodedToken.email_verified,
		};

		next();
	} catch (error) {
		console.error('Firebase token verification error:', error);
		return res.status(401).json({ message: 'Invalid Firebase token' });
	}
};

// Middleware to protect routes with access tokens
const verifyUser = async (req, res, next) => {
	try {
		const token = req?.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
		if (!token) {
			return res.status(401).json({ message: 'No token, authorization denied' });
		}

		// Verify the access token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// Find user by ID from the decoded token (exclude sensitive data)
		const user = await User.findById(decoded.user.id).select('-firebaseUid -refreshTokens');
		if (!user) {
			return res.status(401).json({ message: 'Token is not valid' });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error('Token verification error:', error);
		res.status(401).json({ message: 'Token is not valid' });
	}
};

// Middleware to verify refresh tokens
const verifyRefreshToken = async (req, res, next) => {
	try {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				message: 'No refresh token provided',
			});
		}

		// Verify the refresh token
		let decoded;
		try {
			decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
		} catch (jwtError) {
			return res.status(401).json({
				success: false,
				message: 'Invalid or expired refresh token',
			});
		}

		// Find user and check if refresh token exists and is not used
		const user = await User.findById(decoded.userId);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found',
			});
		}

		const storedToken = user.refreshTokens.find(
			(t) => t.tokenId === decoded.tokenId && !t.isUsed && t.expiresAt > new Date()
		);

		if (!storedToken) {
			// Token was already used, expired, or doesn't exist - potential security breach
			// Clear all refresh tokens for this user
			user.refreshTokens = [];
			await user.save();

			// Clear the refresh token cookie
			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
				path: '/',
			});

			return res.status(401).json({
				success: false,
				message: 'Invalid refresh token - all sessions terminated',
				forceReLogin: true,
			});
		}

		// Attach user and token data to request
		req.user = user;
		req.refreshTokenData = {
			decoded,
			storedToken,
		};

		next();
	} catch (error) {
		console.error('Refresh token verification error:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
			error: error.message,
		});
	}
};

// Role-based access control
const verifyRole = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'User not authenticated' });
		}

		// Allow admin to access all routes
		if (req.user.role === 'admin') {
			return next();
		}

		// Check if user has the required role
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
		}

		next();
	};
};

module.exports = { verifyUser, verifyRole, verifyFirebaseToken, verifyRefreshToken };
