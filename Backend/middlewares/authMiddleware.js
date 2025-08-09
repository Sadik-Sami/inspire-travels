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
		console.log('Decoded Firebase token:', decodedToken);
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

// Middleware to protect routes
const verifyUser = async (req, res, next) => {
	try {
		const token = req?.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return res.status(401).json({ message: 'No token, authorization denied' });
		}

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find user by ID from the decoded token
		const user = await User.findById(decoded.user.id).select('-firebaseUid');

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

module.exports = { verifyUser, verifyRole, verifyFirebaseToken };
