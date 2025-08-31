const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			maxlength: [100, 'Title cannot exceed 100 characters'],
		},
		content: {
			type: String,
			required: [true, 'Content is required'],
			trim: true,
			maxlength: [500, 'Content cannot exceed 500 characters'],
		},
		category: {
			type: String,
			required: [true, 'Category is required'],
			enum: {
				values: ['Visa Success', 'Happy Clients', 'Tours', 'Destinations', 'Events', 'Other'],
				message: 'Category must be one of: Visa Success, Happy Clients, Tours, Destinations, Events, Other',
				default: 'Other',
			},
		},
		tags: [
			{
				type: String,
				trim: true,
				maxlength: [30, 'Tag cannot exceed 30 characters'],
			},
		],
		image: {
			url: {
				type: String,
				required: [true, 'Image URL is required'],
			},
			publicId: {
				type: String,
				required: [true, 'Image public ID is required'],
			},
			width: Number,
			height: Number,
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

// Indexes for better performance
gallerySchema.index({ category: 1, isActive: 1 });
gallerySchema.index({ createdAt: -1 });
gallerySchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Gallery', gallerySchema);
