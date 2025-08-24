const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate access token (short-lived - 1 hour)
const generateAccessToken = (userId, role) => {
	return jwt.sign(
		{
			user: {
				id: userId,
				role: role,
			},
			type: 'access',
		},
		process.env.JWT_SECRET,
		{ expiresIn: '1h' }
	);
};

// Generate refresh token (long-lived - 6 hours)
const generateRefreshToken = (userId, tokenId) => {
	return jwt.sign(
		{
			userId: userId,
			tokenId: tokenId,
			type: 'refresh',
		},
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

// Generate unique token ID for refresh tokens
const generateTokenId = () => {
	return crypto.randomBytes(32).toString('hex');
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	generateTokenId,
};
