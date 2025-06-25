const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');

// Create a new booking
router.post('/', verifyUser, async (req, res) => {
	try {
		const {
			destinationId,
			fullName,
			email,
			phone,
			travelDate,
			numberOfTravelers,
			specialRequests,
			dietaryRestrictions,
			pricing,
		} = req.body;

		// Validate required fields
		if (!destinationId || !fullName || !email || !phone || !travelDate) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// Validate destination exists
		const destination = await Destination.findById(destinationId);
		if (!destination) {
			return res.status(404).json({ message: 'Destination not found' });
		}

		// Create booking object
		const newBooking = new Booking({
			destination: destinationId,
			user: req.user._id,
			fullName,
			email,
			phone,
			travelDate: new Date(travelDate),
			numberOfTravelers: {
				adults: numberOfTravelers?.adults || 1,
				children: numberOfTravelers?.children || 0,
			},
			specialRequests: specialRequests || '',
			dietaryRestrictions: dietaryRestrictions || [],
			pricing: {
				basePrice: destination.pricing?.basePrice || 0,
				discountedPrice: destination.pricing?.discountedPrice || 0,
				totalPrice: calculateTotalPrice(
					destination.pricing?.discountedPrice || 0,
					numberOfTravelers?.adults || 1,
					numberOfTravelers?.children || 0
				),
				currency: destination.pricing?.currency || 'USD',
				paymentStatus: 'pending',
			},
			status: 'pending',
			destinationDetails: {
				title: destination.title,
				location:
					destination.location?.address ||
					(destination.location?.from && destination.location?.to
						? `${destination.location.from} to ${destination.location.to}`
						: 'Location not specified'),
				duration: {
					days: destination.duration?.days || 0,
					nights: destination.duration?.nights || 0,
				},
				image:
					destination.images && destination.images.length > 0
						? destination.images[0].url
						: destination.coverImage
						? destination.coverImage.url
						: '',
			},
		});

		// Save booking
		await newBooking.save();

		res.status(201).json({
			message: 'Booking created successfully',
			booking: newBooking,
		});
	} catch (error) {
		console.error('Error creating booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Get all bookings for the current user
router.get('/my-bookings', verifyUser, async (req, res) => {
	try {
		const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

		res.status(200).json({ bookings });
	} catch (error) {
		console.error('Error fetching bookings:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Get a specific booking by ID
router.get('/:id', verifyUser, async (req, res) => {
	try {
		const booking = await Booking.findOne({
			_id: req.params.id,
			user: req.user._id,
		}).lean();

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		res.status(200).json({ booking });
	} catch (error) {
		console.error('Error fetching booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Cancel a booking
router.patch('/:id/cancel', verifyUser, async (req, res) => {
	try {
		const booking = await Booking.findOne({
			_id: req.params.id,
			user: req.user._id,
		});

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		// Only allow cancellation if booking is pending or confirmed
		if (!['pending', 'confirmed'].includes(booking.status)) {
			return res.status(400).json({
				message: `Cannot cancel a booking with status: ${booking.status}`,
			});
		}

		booking.status = 'cancelled';
		booking.pricing.paymentStatus = 'refunded';
		await booking.save();

		res.status(200).json({
			message: 'Booking cancelled successfully',
			booking,
		});
	} catch (error) {
		console.error('Error cancelling booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Admin routes

// Get all bookings (admin only)
router.get('/', verifyUser, async (req, res) => {
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

		if (req.query.destination) {
			filter.destination = req.query.destination;
		}

		// Search by name or email
		if (req.query.search) {
			filter.$or = [
				{ fullName: { $regex: req.query.search, $options: 'i' } },
				{ email: { $regex: req.query.search, $options: 'i' } },
			];
		}

		// Get bookings with pagination
		const bookings = await Booking.find(filter)
			.populate('user', 'email')
			.populate('destination', 'title')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Get total count for pagination
		const total = await Booking.countDocuments(filter);

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
		console.error('Error fetching bookings:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Update booking status (admin only)
router.patch('/:id/status', verifyUser, verifyRole('admin', 'employee'), async (req, res) => {
	try {
		const { status, paymentStatus } = req.body;

		if (!status && !paymentStatus) {
			return res.status(400).json({ message: 'No updates provided' });
		}

		const booking = await Booking.findById(req.params.id);

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
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
			message: 'Booking updated successfully',
			booking,
		});
	} catch (error) {
		console.error('Error updating booking:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Helper function to calculate total price
function calculateTotalPrice(basePrice, adults, children) {
	// Apply a 50% discount for children
	const childrenPrice = basePrice * 0.5 * children;
	const adultsPrice = basePrice * adults;
	return adultsPrice + childrenPrice;
}

module.exports = router;
