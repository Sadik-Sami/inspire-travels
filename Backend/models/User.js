const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		address: {
			type: String,
			trim: true,
		},
		passportNumber: {
			type: String,
			trim: true,
		},
		profileImage: {
			url: {
				type: String,
				default: '',
			},
			publicId: {
				type: String,
				default: '',
			},
		},
		role: {
			type: String,
			enum: ['customer', 'admin', 'moderator', 'employee'],
			default: 'customer',
		},
		firebaseUid: {
			type: String,
			required: true,
			unique: true,
		},
		refreshTokens: [
			{
				tokenId: {
					type: String,
					required: true,
				},
				token: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
				expiresAt: {
					type: Date,
					default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				},
				isUsed: {
					type: Boolean,
					default: false,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Index for better query performance
userSchema.index({ name: 1 });
userSchema.index({ passportNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'refreshTokens.tokenId': 1 });

module.exports = mongoose.model('User', userSchema);
