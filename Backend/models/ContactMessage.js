const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			trim: true,
			lowercase: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
		},
		subject: {
			type: String,
			required: [true, 'Subject is required'],
			trim: true,
			maxlength: [200, 'Subject cannot exceed 200 characters'],
		},
		message: {
			type: String,
			required: [true, 'Message is required'],
			trim: true,
			maxlength: [2000, 'Message cannot exceed 2000 characters'],
		},
		status: {
			type: String,
			enum: ['unread', 'read', 'replied', 'archived'],
			default: 'unread',
		},
		priority: {
			type: String,
			enum: ['low', 'medium', 'high'],
			default: 'medium',
		},
		adminNotes: {
			type: String,
			trim: true,
			maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
		},
		readBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		readAt: {
			type: Date,
		},
		repliedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Index for better query performance
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ email: 1 });
ContactMessageSchema.index({ name: 1 });

// Virtual for message age
ContactMessageSchema.virtual('messageAge').get(function () {
	const now = new Date();
	const created = this.createdAt;
	const diffTime = Math.abs(now - created);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 1) return 'Less than a day ago';
	if (diffDays === 1) return '1 day ago';
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
	return `${Math.ceil(diffDays / 30)} months ago`;
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
