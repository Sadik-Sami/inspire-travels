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
	},
	{
		timestamps: true,
	}
);

// Index for better query performance
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ passportNumber: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
