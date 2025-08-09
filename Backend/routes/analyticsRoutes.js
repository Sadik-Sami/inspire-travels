const express = require('express');
const router = express.Router();
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Booking = require('../models/Booking');
const VisaBooking = require('../models/VisaBooking');
const Invoice = require('../models/Invoice');
const Blog = require('../models/Blog');

// Dashboard summary - all key metrics in one request
router.get('/dashboard-summary', verifyUser, verifyRole('admin', 'moderator', 'employee'), async (req, res) => {
	try {
		// Get date range for recent activity (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// User statistics
		const totalUsers = await User.countDocuments();
		const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
		const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

		// Booking statistics
		const totalBookings = await Booking.countDocuments();
		const recentBookings = await Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
		const bookingsByStatus = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
		const bookingRevenue = await Booking.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: '$pricing.totalPrice' },
					pending: { $sum: { $cond: [{ $eq: ['$pricing.paymentStatus', 'pending'] }, '$pricing.totalPrice', 0] } },
					paid: { $sum: { $cond: [{ $eq: ['$pricing.paymentStatus', 'paid'] }, '$pricing.totalPrice', 0] } },
				},
			},
		]);

		// Visa booking statistics
		const totalVisaBookings = await VisaBooking.countDocuments();
		const recentVisaBookings = await VisaBooking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
		const visaBookingsByStatus = await VisaBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
		const visaBookingRevenue = await VisaBooking.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: '$pricing.totalPrice' },
					pending: { $sum: { $cond: [{ $eq: ['$pricing.paymentStatus', 'pending'] }, '$pricing.totalPrice', 0] } },
					paid: { $sum: { $cond: [{ $eq: ['$pricing.paymentStatus', 'paid'] }, '$pricing.totalPrice', 0] } },
				},
			},
		]);

		// Invoice statistics
		const totalInvoices = await Invoice.countDocuments();
		const recentInvoices = await Invoice.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
		const invoicesByStatus = await Invoice.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
		const invoiceRevenue = await Invoice.aggregate([
			{
				$group: {
					_id: null,
					totalAmount: { $sum: '$totalAmount' },
					paidAmount: { $sum: '$paidAmount' },
					dueAmount: { $sum: '$dueAmount' },
				},
			},
		]);

		// Blog statistics
		const totalBlogs = await Blog.countDocuments();
		const publishedBlogs = await Blog.countDocuments({ status: 'published' });
		const draftBlogs = await Blog.countDocuments({ status: 'draft' });
		const totalViews = await Blog.aggregate([{ $group: { _id: null, totalViews: { $sum: '$viewCount' } } }]);

		// Format response data
		const formatAggregateData = (data, field) => {
			const result = {};
			data.forEach((item) => {
				result[item._id] = item[field];
			});
			return result;
		};

		res.status(200).json({
			success: true,
			data: {
				users: {
					total: totalUsers,
					new: newUsers,
					byRole: formatAggregateData(usersByRole, 'count'),
				},
				bookings: {
					total: totalBookings,
					recent: recentBookings,
					byStatus: formatAggregateData(bookingsByStatus, 'count'),
					revenue: bookingRevenue.length > 0 ? bookingRevenue[0] : { total: 0, pending: 0, paid: 0 },
				},
				visaBookings: {
					total: totalVisaBookings,
					recent: recentVisaBookings,
					byStatus: formatAggregateData(visaBookingsByStatus, 'count'),
					revenue: visaBookingRevenue.length > 0 ? visaBookingRevenue[0] : { total: 0, pending: 0, paid: 0 },
				},
				invoices: {
					total: totalInvoices,
					recent: recentInvoices,
					byStatus: formatAggregateData(invoicesByStatus, 'count'),
					revenue: invoiceRevenue.length > 0 ? invoiceRevenue[0] : { totalAmount: 0, paidAmount: 0, dueAmount: 0 },
				},
				blogs: {
					total: totalBlogs,
					published: publishedBlogs,
					draft: draftBlogs,
					totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
				},
			},
		});
	} catch (error) {
		console.error('Dashboard summary error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch dashboard data',
			error: error.message,
		});
	}
});

// Monthly revenue trends
router.get('/monthly-revenue', verifyUser, verifyRole('admin', 'moderator', 'employee'), async (req, res) => {
	try {
		const { year = new Date().getFullYear() } = req.query;

		// Get monthly data for the specified year
		const bookingRevenue = await Booking.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$createdAt' },
					revenue: { $sum: '$pricing.totalPrice' },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const visaRevenue = await VisaBooking.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$createdAt' },
					revenue: { $sum: '$pricing.totalPrice' },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const invoiceRevenue = await Invoice.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$createdAt' },
					invoiced: { $sum: '$totalAmount' },
					collected: { $sum: '$paidAmount' },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Format the data for all months
		const formattedData = Array(12)
			.fill(0)
			.map((_, index) => {
				const month = index + 1;
				const monthName = new Date(0, index).toLocaleString('default', { month: 'long' });

				const bookingData = bookingRevenue.find((item) => item._id === month) || { revenue: 0, count: 0 };
				const visaData = visaRevenue.find((item) => item._id === month) || { revenue: 0, count: 0 };
				const invoiceData = invoiceRevenue.find((item) => item._id === month) || {
					invoiced: 0,
					collected: 0,
					count: 0,
				};

				return {
					month,
					monthName,
					bookingRevenue: bookingData.revenue,
					bookingCount: bookingData.count,
					visaRevenue: visaData.revenue,
					visaCount: visaData.count,
					invoicedAmount: invoiceData.invoiced,
					collectedAmount: invoiceData.collected,
					invoiceCount: invoiceData.count,
					totalRevenue: bookingData.revenue + visaData.revenue + invoiceData.collected,
				};
			});

		res.status(200).json({
			success: true,
			data: formattedData,
			year,
		});
	} catch (error) {
		console.error('Monthly revenue error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch monthly revenue data',
			error: error.message,
		});
	}
});

// User growth over time
router.get('/user-growth', verifyUser, verifyRole('admin', 'moderator', 'employee'), async (req, res) => {
	try {
		const { year = new Date().getFullYear() } = req.query;

		const userGrowth = await User.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$createdAt' },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Format the data for all months
		const formattedData = Array(12)
			.fill(0)
			.map((_, index) => {
				const month = index + 1;
				const monthName = new Date(0, index).toLocaleString('default', { month: 'long' });
				const userData = userGrowth.find((item) => item._id === month) || { count: 0 };

				return {
					month,
					monthName,
					newUsers: userData.count,
				};
			});

		// Calculate cumulative growth
		let cumulativeUsers = 0;
		formattedData.forEach((month) => {
			cumulativeUsers += month.newUsers;
			month.cumulativeUsers = cumulativeUsers;
		});

		res.status(200).json({
			success: true,
			data: formattedData,
			year,
		});
	} catch (error) {
		console.error('User growth error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch user growth data',
			error: error.message,
		});
	}
});

// Blog performance
router.get('/blog-performance', verifyUser, verifyRole('admin', 'moderator', 'employee'), async (req, res) => {
	try {
		// Get top performing blogs by views
		const topBlogs = await Blog.find({ status: 'published' })
			.sort({ viewCount: -1 })
			.limit(5)
			.select('title slug viewCount readTime createdAt');

		// Get blog views by category
		const viewsByCategory = await Blog.aggregate([
			{ $match: { status: 'published' } },
			{ $unwind: '$categories' },
			{
				$group: {
					_id: '$categories',
					totalViews: { $sum: '$viewCount' },
					count: { $sum: 1 },
				},
			},
			{ $sort: { totalViews: -1 } },
		]);

		res.status(200).json({
			success: true,
			data: {
				topBlogs,
				viewsByCategory,
			},
		});
	} catch (error) {
		console.error('Blog performance error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch blog performance data',
			error: error.message,
		});
	}
});

// Recent activity
router.get('/recent-activity', verifyUser, verifyRole('admin', 'moderator', 'employee'), async (req, res) => {
	try {
		// Get recent bookings
		const recentBookings = await Booking.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.select('fullName email status pricing.totalPrice createdAt');

		// Get recent visa bookings
		const recentVisaBookings = await VisaBooking.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.select('firstName lastName email status pricing.totalPrice createdAt');

		// Get recent invoices
		const recentInvoices = await Invoice.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.select('invoiceNumber customer.name totalAmount status createdAt');

		// Get recent users
		const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');

		// Get recent blogs
		const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5).select('title status viewCount createdAt');

		res.status(200).json({
			success: true,
			data: {
				recentBookings,
				recentVisaBookings,
				recentInvoices,
				recentUsers,
				recentBlogs,
			},
		});
	} catch (error) {
		console.error('Recent activity error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch recent activity data',
			error: error.message,
		});
	}
});

module.exports = router;
