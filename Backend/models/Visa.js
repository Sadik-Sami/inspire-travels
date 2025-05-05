const mongoose = require('mongoose');

const visaSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		shortDescription: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		pricing: {
			basePrice: {
				type: Number,
				required: true,
				min: 0,
			},
			discountedPrice: {
				type: Number,
				min: 0,
			},
			currency: {
				type: String,
				default: 'USD',
				enum: ['USD', 'EUR', 'GBP', 'BDT'],
			},
		},
		images: [
			{
				url: String,
				publicId: String,
				alt: String,
			},
		],
		coverImage: {
			url: String,
			publicId: String,
			alt: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Create indexes for better query performance
visaSchema.index({ title: 'text' });
visaSchema.index({ slug: 1 });
visaSchema.index({ isActive: 1 });
visaSchema.index({ 'pricing.basePrice': 1 });

module.exports = mongoose.model('Visa', visaSchema);