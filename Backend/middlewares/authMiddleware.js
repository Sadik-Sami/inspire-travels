const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/authUtils');

// Middleware to protect routes
const verifyUser = async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			// Get token from header
			token = req.headers.authorization.split(' ')[1];

			// Verify token
			const decoded = verifyAccessToken(token);

			if (!decoded) {
				return res.status(401).json({
					message: 'Token expired or invalid',
					tokenExpired: true,
				});
			}

			// Get user from the token
			req.user = await User.findById(decoded.user.id).select('-password -refreshTokens');

			if (!req.user) {
				return res.status(401).json({ message: 'User not found' });
			}

			next();
		} catch (error) {
			console.log('Token Verification Failed', error);
			res.status(401).json({
				message: 'Not Authorized, token failed',
				tokenExpired: error.name === 'TokenExpiredError',
			});
		}
	} else {
		res.status(401).json({ message: 'Not Authorized, No token provided' });
	}
};

// Role-based access control
const verifyRole = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Access Forbidden' });
		}
		next();
	};
};

module.exports = { verifyUser, verifyRole };
