const mongoose = require('mongoose');

const visaBookingSchema = new mongoose.Schema(
	{
		visa: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Visa',
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		// Basic booking information
		name: {
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
		// Visa specific details
		nationality: {
			type: String,
			required: true,
			trim: true,
		},
		passportNumber: {
			type: String,
			required: true,
			trim: true,
		},
		travelDate: {
			type: Date,
			required: true,
		},
		// Special requests
		specialRequests: {
			type: String,
			trim: true,
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
			enum: ['pending', 'processing', 'approved', 'rejected', 'completed'],
			default: 'pending',
		},
		// Additional metadata
		visaDetails: {
			title: String,
			from: String,
			to: String,
			processingTime: String,
			image: String,
		},
	},
	{ timestamps: true }
);

// Add indexes for common queries
visaBookingSchema.index({ user: 1, createdAt: -1 });
visaBookingSchema.index({ visa: 1 });
visaBookingSchema.index({ status: 1 });
visaBookingSchema.index({ 'pricing.paymentStatus': 1 });

const VisaBooking = mongoose.model('VisaBooking', visaBookingSchema);

module.exports = VisaBooking;
