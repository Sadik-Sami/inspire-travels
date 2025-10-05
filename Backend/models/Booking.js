const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
	{
		destination: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Destination',
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		// Basic booking information
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
		},
		// Trip details
		travelDate: {
			type: Date,
			required: true,
		},
		numberOfTravelers: {
			adults: {
				type: Number,
				required: true,
				default: 1,
				min: 1,
			},
			children: {
				type: Number,
				required: true,
				default: 0,
				min: 0,
			},
		},
		// Special requests and preferences
		specialRequests: {
			type: String,
			trim: true,
		},
		dietaryRestrictions: {
			type: [String],
			default: [],
		},
		// Payment and pricing information
		pricing: {
			basePrice: {
				type: Number,
				required: true,
			},
			discountedPrice: {
				type: Number,
				required: true,
			},
			totalPrice: {
				type: Number,
				required: true,
			},
			currency: {
				type: String,
				default: 'USD',
			},
			paymentStatus: {
				type: String,
				enum: ['pending', 'paid', 'refunded', 'cancelled'],
				default: 'pending',
			},
		},
		// Booking status
		status: {
			type: String,
			enum: ['pending', 'confirmed', 'cancelled', 'completed'],
			default: 'pending',
		},
		// Additional metadata
		destinationDetails: {
			title: String,
			location: String,
			duration: {
				days: Number,
				nights: Number,
			},
			image: String,
		},
	},
	{ timestamps: true }
);

// Add indexes for common queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ destination: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'pricing.paymentStatus': 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
