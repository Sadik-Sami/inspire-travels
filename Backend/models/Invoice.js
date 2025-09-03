const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
	{
		invoiceNumber: {
			type: String,
			required: true,
			unique: true,
		},
		customer: {
			name: {
				type: String,
				required: true,
			},
			email: {
				type: String,
			},
			phone: {
				type: String,
				required: true,
			},
			address: {
				type: String,
				default: '',
			},
		},
		items: [
			{
				name: {
					type: String,
					required: true,
				},
				description: {
					type: String,
					default: '',
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				unitPrice: {
					type: Number,
					required: true,
					min: 0,
				},
				discount: {
					type: Number,
					default: 0,
					min: 0,
				},
				tax: {
					type: Number,
					default: 0,
					min: 0,
				},
				total: {
					type: Number,
					required: true,
				},
			},
		],
		subtotal: {
			type: Number,
			required: true,
		},
		totalDiscount: {
			type: Number,
			default: 0,
		},
		additionalDiscount: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalTax: {
			type: Number,
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		paidAmount: {
			type: Number,
			default: 0,
		},
		dueAmount: {
			type: Number,
			required: true,
		},
		issueDate: {
			type: Date,
			required: true,
			default: Date.now,
		},
		dueDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'void'],
			default: 'draft',
		},
		notes: {
			type: String,
			default: '',
		},
		terms: {
			type: String,
			default: 'Payment is due within 30 days. Thank you for your business.',
		},
		currency: {
			type: String,
			enum: ['USD', 'EUR', 'GBP', 'BDT'],
			default: 'BDT',
		},
		relatedTo: {
			type: {
				type: String,
				enum: ['custom', 'booking', 'visa'],
				default: 'custom',
			},
			bookingId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Booking',
				default: null,
			},
			visaBookingId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'VisaBooking',
				default: null,
			},
		},
		invoicer: {
			name: {
				type: String,
				required: true,
			},
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		},
		updateHistory: [
			{
				updaterName: {
					type: String,
					required: true,
				},
				updaterId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				updateNotes: {
					type: String,
					default: '',
				},
				previousStatus: {
					type: String,
					enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'void', null],
					default: null,
				},
				newStatus: {
					type: String,
					enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'void', null],
					default: null,
				},
				previousPaidAmount: {
					type: Number,
					default: null,
				},
				newPaidAmount: {
					type: Number,
					default: null,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

// Generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function () {
	const date = new Date();
	const year = date.getFullYear().toString().slice(-2);
	const month = (date.getMonth() + 1).toString().padStart(2, '0');

	// Find the latest invoice for this month
	const latestInvoice = await this.findOne({
		invoiceNumber: new RegExp(`^INV-${year}${month}-`),
	}).sort({ invoiceNumber: -1 });

	let sequenceNumber = 1;
	if (latestInvoice) {
		// Extract the sequence number from the latest invoice
		const parts = latestInvoice.invoiceNumber.split('-');
		sequenceNumber = Number.parseInt(parts[2]) + 1;
	}

	// Format: INV-YYMM-SEQUENCE
	return `INV-${year}${month}-${sequenceNumber.toString().padStart(4, '0')}`;
};

// Update status based on payment
InvoiceSchema.pre('save', function (next) {
	// Recalculate dueAmount
	this.dueAmount = this.totalAmount - this.paidAmount;

	// Update status based on payment
	if (this.paidAmount >= this.totalAmount) {
		this.status = 'paid';
	} else if (this.paidAmount > 0) {
		this.status = 'partially_paid';
	} else if (
		this.dueDate < new Date() &&
		this.status !== 'paid' &&
		this.status !== 'cancelled' &&
		this.status !== 'void'
	) {
		this.status = 'overdue';
	}

	next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
