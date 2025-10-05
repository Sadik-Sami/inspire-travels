const mongoose = require('mongoose');

// Define the Visa schema
const visaSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'A visa package must have a title'],
			trim: true,
			index: true, // Add index for search performance
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true, // Add index for slug lookups
		},
		shortDescription: {
			type: String,
			required: [true, 'A visa package must have a short description'],
			trim: true,
			index: true, // Add index for search performance
		},
		description: {
			type: String,
			required: [true, 'A visa package must have a detailed description'],
			trim: true,
		},
		pricing: {
			basePrice: {
				type: Number,
				required: [true, 'A visa package must have a base price'],
				min: [0, 'Price must be above 0'],
			},
			discountedPrice: {
				type: Number,
				default: function () {
					return this.pricing.basePrice;
				},
				min: [0, 'Discounted price must be above 0'],
			},
			currency: {
				type: String,
				enum: ['USD', 'EUR', 'GBP', 'BDT'],
				default: 'BDT',
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
			index: true, // Add index for filtering by active status
		},
		requirements: {
			type: String,
			trim: true,
		},
		processingTime: {
			type: String,
			trim: true,
		},
		specialRequests: {
			type: String,
			trim: true,
		},
		from: {
			type: String,
			required: [true, 'A visa package must have a departure country'],
			trim: true,
			index: true, // Add index for filtering by from country
		},
		to: {
			type: String,
			required: [true, 'A visa package must have a destination country'],
			trim: true,
			index: true, // Add index for filtering by to country
		},
		featured: {
			type: Boolean,
			default: false,
			index: true, // Add index for featured visas
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Create compound indexes for common search patterns
visaSchema.index({ title: 1, from: 1, to: 1, isActive: 1 });
visaSchema.index({ featured: 1, isActive: 1 });

// Add a virtual property for formatted price
visaSchema.virtual('formattedPrice').get(function () {
	const currencySymbols = {
		USD: '$',
		EUR: '€',
		GBP: '£',
		BDT: '৳',
	};

	return `${currencySymbols[this.pricing.currency] || this.pricing.currency}${this.pricing.basePrice.toLocaleString()}`;
});

// Add a virtual property for formatted discounted price
visaSchema.virtual('formattedDiscountedPrice').get(function () {
	const currencySymbols = {
		USD: '$',
		EUR: '€',
		GBP: '£',
		BDT: '৳',
	};

	return `${
		currencySymbols[this.pricing.currency] || this.pricing.currency
	}${this.pricing.discountedPrice.toLocaleString()}`;
});

// Add a virtual property for discount percentage
visaSchema.virtual('discountPercentage').get(function () {
	if (!this.pricing.discountedPrice || this.pricing.discountedPrice >= this.pricing.basePrice) {
		return 0;
	}

	const discount = ((this.pricing.basePrice - this.pricing.discountedPrice) / this.pricing.basePrice) * 100;
	return Math.round(discount);
});

const Visa = mongoose.model('Visa', visaSchema);

module.exports = Visa;
