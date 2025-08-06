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
				token: {
					type: String,
					required: true,
				},
				expiresAt: {
					type: Date,
					required: true,
				},
				userAgent: {
					type: String,
					default: 'unknown',
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ role: 1 }); // Add role index for better filtering performance
userSchema.index({ createdAt: -1 }); // Add createdAt index for sorting

// Remove expired refresh tokens before saving
userSchema.pre('save', function (next) {
	this.refreshTokens = this.refreshTokens.filter((tokenObj) => tokenObj.expiresAt > new Date());
	next();
});

// Handle version conflicts by retrying the save operation
userSchema.post('save', function (error, doc, next) {
	if (error.name === 'VersionError') {
		// Retry the save operation
		this.save(next);
	} else {
		next(error);
	}
});

module.exports = mongoose.model('User', userSchema);
