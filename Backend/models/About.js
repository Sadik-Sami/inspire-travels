const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			maxlength: [200, 'Title cannot exceed 200 characters'],
		},
		content: {
			type: String,
			required: [true, 'Content is required'],
			trim: true,
			maxlength: [5000, 'Content cannot exceed 5000 characters'],
		},
		image: {
			url: {
				type: String,
				required: [true, 'Image URL is required'],
			},
			publicId: {
				type: String,
				required: [true, 'Image public ID is required'],
			},
		},
		happyTravelers: {
			type: Number,
			required: [true, 'Happy travelers count is required'],
			min: [0, 'Happy travelers cannot be negative'],
			default: 0,
		},
		destinations: {
			type: Number,
			required: [true, 'Destinations count is required'],
			min: [0, 'Destinations cannot be negative'],
			default: 0,
		},
		yearsOfExperience: {
			type: Number,
			required: [true, 'Years of experience is required'],
			min: [0, 'Years of experience cannot be negative'],
			default: 0,
		},
		averageRating: {
			type: Number,
			required: [true, 'Average rating is required'],
			min: [0, 'Rating cannot be negative'],
			max: [5, 'Rating cannot exceed 5'],
			default: 0,
		},
		satisfiedCustomers: {
			type: Number,
			required: [true, 'Satisfied customers count is required'],
			min: [0, 'Satisfied customers cannot be negative'],
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

// Index for better query performance
aboutSchema.index({ isActive: 1 });
aboutSchema.index({ createdAt: -1 });

module.exports = mongoose.model('About', aboutSchema);
