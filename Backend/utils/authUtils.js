const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate access token (short-lived JWT)
const generateAccessToken = (userId, role) => {
	const payload = { user: { id: userId, role } };
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate refresh token (longer-lived, random token)
const generateRefreshToken = () => {
	return crypto.randomBytes(40).toString('hex');
};

// Calculate refresh token expiry (e.g., 7 days from now)
const calculateRefreshTokenExpiry = () => {
	const expiryDays = 7;
	return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
};

// Verify access token
const verifyAccessToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	calculateRefreshTokenExpiry,
	verifyAccessToken,
};
