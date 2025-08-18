const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Customer name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters'],
		},
		phone: {
			type: String,
			required: [true, 'Phone number is required'],
			unique: true,
			trim: true,
			validate: {
				validator: (v) => {
					return /^[+]?[1-9][\d]{0,15}$/.test(v);
				},
				message: 'Please enter a valid phone number',
			},
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			validate: {
				validator: (v) => {
					if (!v) return true;
					return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
				},
				message: 'Please enter a valid email address',
			},
		},
		address: {
			type: String,
			trim: true,
			maxlength: [500, 'Address cannot exceed 500 characters'],
		},
		passportNumber: {
			type: String,
			trim: true,
			uppercase: true,
			maxlength: [30, 'Passport number cannot exceed 30 characters'],
		},
		profileImage: {
			url: String,
			publicId: String,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

// Indexes for better query performance
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ createdAt: -1 });

// Pre-save middleware to handle phone number formatting
customerSchema.pre('save', function (next) {
	if (this.phone) {
		// Remove any spaces, dashes, or parentheses from phone number
		this.phone = this.phone.replace(/[\s\-$$$$]/g, '');
	}
	next();
});

// Virtual for full customer info (useful for invoices)
customerSchema.virtual('fullInfo').get(function () {
	return {
		name: this.name,
		phone: this.phone,
		email: this.email,
		address: this.address,
		passportNumber: this.passportNumber,
	};
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
