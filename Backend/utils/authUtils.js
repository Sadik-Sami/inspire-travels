const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (userId, role) => {
	const payload = { user: { id: userId, role } };
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
	generateAccessToken,
};
