const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate access token
const generateAccessToken = (userId, role) => {
	const payload = { user: { id: userId, role } };
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Generate refresh token
const generateRefreshToken = () => {
	return crypto.randomBytes(40).toString('hex');
};

// Calculate refresh token expiry (30 days from now)
const calculateRefreshTokenExpiry = () => {
	return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	calculateRefreshTokenExpiry,
};
