const express = require('express');
const router = express.Router();
const VisaBooking = require('../models/VisaBooking');
const Visa = require('../models/Visa');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');

// Create a new visa booking
router.post('/', verifyUser, async (req, res) => {
	try {
		const { visaId, firstName, lastName, email, phone, nationality, passportNumber, travelDate, specialRequests } =
			req.body;

		// Validate required fields
		if (!visaId || !firstName || !lastName || !email || !phone || !nationality || !passportNumber || !travelDate) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// Validate visa exists
		const visa = await Visa.findById(visaId);
		if (!visa) {
			return res.status(404).json({ message: 'Visa package not found' });
		}

		// Create booking object
		const newVisaBooking = new VisaBooking({
			visa: visaId,
			user: req.user._id,
			firstName,
			lastName,
			email,
			phone,
			nationality,
			passportNumber,
			travelDate: new Date(travelDate),
			specialRequests: specialRequests || '',
			pricing: {
				basePrice: visa.pricing?.basePrice || 0,
				discountedPrice: visa.pricing?.discountedPrice || visa.pricing?.basePrice || 0,
				totalPrice: visa.pricing?.discountedPrice || visa.pricing?.basePrice || 0,
				currency: visa.pricing?.currency || 'USD',
				paymentStatus: 'pending',
			},
			status: 'pending',
			visaDetails: {
				title: visa.title,
				from: visa.from,
				to: visa.to,
				processingTime: visa.processingTime || 'Standard processing',
				image: visa.coverImage?.url || (visa.images && visa.images.length > 0 ? visa.images[0].url : ''),
			},
		});

		// Save booking
		await newVisaBooking.save();

		res.status(201).json({
			message: 'Visa booking created successfully',
			booking: newVisaBooking,
		});
	} catch (error) {
		console.error('Error creating visa booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Get all visa bookings for the current user
router.get('/my-bookings', verifyUser, async (req, res) => {
	try {
		const bookings = await VisaBooking.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

		res.status(200).json({ bookings });
	} catch (error) {
		console.error('Error fetching visa bookings:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Get a specific visa booking by ID
router.get('/:id', verifyUser, async (req, res) => {
	try {
		const booking = await VisaBooking.findOne({
			_id: req.params.id,
			user: req.user._id,
		}).lean();

		if (!booking) {
			return res.status(404).json({ message: 'Visa booking not found' });
		}

		res.status(200).json({ booking });
	} catch (error) {
		console.error('Error fetching visa booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Cancel a visa booking
router.patch('/:id/cancel', verifyUser, async (req, res) => {
	try {
		const booking = await VisaBooking.findOne({
			_id: req.params.id,
			user: req.user._id,
		});

		if (!booking) {
			return res.status(404).json({ message: 'Visa booking not found' });
		}

		// Only allow cancellation if booking is pending or processing
		if (!['pending', 'processing'].includes(booking.status)) {
			return res.status(400).json({
				message: `Cannot cancel a visa booking with status: ${booking.status}`,
			});
		}

		booking.status = 'rejected';
		booking.pricing.paymentStatus = 'refunded';
		await booking.save();

		res.status(200).json({
			message: 'Visa booking cancelled successfully',
			booking,
		});
	} catch (error) {
		console.error('Error cancelling visa booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Admin routes

// Get all visa bookings (admin only)
router.get('/', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const page = Number.parseInt(req.query.page) || 1;
		const limit = Number.parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Build filter object
		const filter = {};

		// Only add status filter if it's not empty (handles 'all' value from frontend)
		if (req.query.status && req.query.status.trim() !== '') {
			filter.status = req.query.status;
		}

		// Only add payment status filter if it's not empty (handles 'all' value from frontend)
		if (req.query.paymentStatus && req.query.paymentStatus.trim() !== '') {
			filter['pricing.paymentStatus'] = req.query.paymentStatus;
		}

		if (req.query.visa) {
			filter.visa = req.query.visa;
		}

		// Search by name or email
		if (req.query.search) {
			filter.$or = [
				{ firstName: { $regex: req.query.search, $options: 'i' } },
				{ lastName: { $regex: req.query.search, $options: 'i' } },
				{ email: { $regex: req.query.search, $options: 'i' } },
			];
		}

		// Get bookings with pagination
		const bookings = await VisaBooking.find(filter)
			.populate('user', 'email')
			.populate('visa', 'title')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Get total count for pagination
		const total = await VisaBooking.countDocuments(filter);

		res.status(200).json({
			bookings,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching visa bookings:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Update visa booking status (admin only)
router.patch('/:id/status', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { status, paymentStatus } = req.body;

		if (!status && !paymentStatus) {
			return res.status(400).json({ message: 'No updates provided' });
		}

		const booking = await VisaBooking.findById(req.params.id);

		if (!booking) {
			return res.status(404).json({ message: 'Visa booking not found' });
		}

		// Update status if provided
		if (status) {
			booking.status = status;
		}

		// Update payment status if provided
		if (paymentStatus) {
			booking.pricing.paymentStatus = paymentStatus;
		}

		await booking.save();

		res.status(200).json({
			message: 'Visa booking updated successfully',
			booking,
		});
	} catch (error) {
		console.error('Error updating visa booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

module.exports = router;
