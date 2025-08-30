const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');
const { VirtualType } = require('mongoose');

// Public route - Submit contact form
router.post('/', async (req, res) => {
	try {
		const { name, email, subject, message } = req.body;

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return res.status(400).json({
				success: false,
				message: 'All fields are required',
			});
		}

		// Create new contact message
		const contactMessage = new ContactMessage({
			name: name.trim(),
			email: email.trim().toLowerCase(),
			subject: subject.trim(),
			message: message.trim(),
		});

		await contactMessage.save();

		res.status(201).json({
			success: true,
			message: "Message sent successfully! We'll get back to you soon.",
			data: {
				id: contactMessage._id,
				name: contactMessage.name,
				email: contactMessage.email,
				subject: contactMessage.subject,
			},
		});
	} catch (error) {
		console.error('Error saving contact message:', error);

		if (error.name === 'ValidationError') {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors,
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to send message. Please try again later.',
		});
	}
});

// Get all messages with filtering, sorting, and pagination
router.get('/messages', verifyUser, verifyRole('admin', 'employee', 'moderator'), async (req, res) => {
	try {
		const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, priority, search } = req.query;

		// Build filter object
		const filter = {};

		if (status && status !== 'all') {
			filter.status = status;
		}

		if (priority && priority !== 'all') {
			filter.priority = priority;
		}

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ subject: { $regex: search, $options: 'i' } },
				{ message: { $regex: search, $options: 'i' } },
			];
		}

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Calculate pagination
		const pageNum = Number.parseInt(page);
		const limitNum = Number.parseInt(limit);
		const skip = (pageNum - 1) * limitNum;

		// Execute queries
		const [messages, totalCount, statusStats] = await Promise.all([
			ContactMessage.find(filter).sort(sort).skip(skip).limit(limitNum).populate('readBy', 'name email').lean(),
			ContactMessage.countDocuments(filter),
			ContactMessage.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
		]);

		// Format status stats
		const formattedStats = {};
		statusStats.forEach((stat) => {
			formattedStats[stat._id] = stat.count;
		});

		// Ensure all statuses are represented
		['unread', 'read', 'replied', 'archived'].forEach((status) => {
			if (!formattedStats[status]) {
				formattedStats[status] = 0;
			}
		});

		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		res.json({
			success: true,
			data: {
				messages,
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalCount,
					hasNextPage,
					hasPrevPage,
					limit: limitNum,
				},
				statusStats: formattedStats,
			},
		});
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch messages',
		});
	}
});

// Get single message by ID
router.get('/messages/:id', verifyUser, verifyRole('admin', 'employee', 'moderator'), async (req, res) => {
	try {
		const message = await ContactMessage.findById(req.params.id).populate('readBy', 'name email');

		if (!message) {
			return res.status(404).json({
				success: false,
				message: 'Message not found',
			});
		}

		res.json({
			success: true,
			data: message,
		});
	} catch (error) {
		console.error('Error fetching message:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch message',
		});
	}
});

// Update message status and admin notes
router.put('/messages/:id/status', verifyUser, verifyRole('admin', 'employee', 'moderator'), async (req, res) => {
	try {
		const { status, adminNotes } = req.body;
		const messageId = req.params.id;

		const updateData = {
			status,
			adminNotes: adminNotes || '',
		};

		// Set read/replied timestamps
		if (status === 'read' && !(await ContactMessage.findOne({ _id: messageId, readAt: { $exists: true } }))) {
			updateData.readAt = new Date();
			updateData.readBy = req.user.uid;
		}

		if (status === 'replied') {
			updateData.repliedAt = new Date();
		}

		const updatedMessage = await ContactMessage.findByIdAndUpdate(messageId, updateData, {
			new: true,
			runValidators: true,
		}).populate('readBy', 'name email');

		if (!updatedMessage) {
			return res.status(404).json({
				success: false,
				message: 'Message not found',
			});
		}

		res.json({
			success: true,
			message: 'Message updated successfully',
			data: updatedMessage,
		});
	} catch (error) {
		console.error('Error updating message:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update message',
		});
	}
});

// Update message priority
router.put('/messages/:id/priority', verifyUser, verifyRole('admin', 'employee', 'moderator'), async (req, res) => {
	try {
		const { priority } = req.body;
		const messageId = req.params.id;

		if (!['low', 'medium', 'high'].includes(priority)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid priority value',
			});
		}

		const updatedMessage = await ContactMessage.findByIdAndUpdate(
			messageId,
			{ priority },
			{ new: true, runValidators: true }
		).populate('readBy', 'name email');

		if (!updatedMessage) {
			return res.status(404).json({
				success: false,
				message: 'Message not found',
			});
		}

		res.json({
			success: true,
			message: 'Priority updated successfully',
			data: updatedMessage,
		});
	} catch (error) {
		console.error('Error updating priority:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update priority',
		});
	}
});

// Update admin notes only
router.put('/messages/:id/notes', verifyUser, verifyRole('admin', 'employee', 'moderator'), async (req, res) => {
	try {
		const { adminNotes } = req.body;
		const messageId = req.params.id;

		const updatedMessage = await ContactMessage.findByIdAndUpdate(
			messageId,
			{ adminNotes: adminNotes || '' },
			{ new: true, runValidators: true }
		).populate('readBy', 'name email');

		if (!updatedMessage) {
			return res.status(404).json({
				success: false,
				message: 'Message not found',
			});
		}

		res.json({
			success: true,
			message: 'Notes updated successfully',
			data: updatedMessage,
		});
	} catch (error) {
		console.error('Error updating notes:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update notes',
		});
	}
});

// Delete message
router.delete('/messages/:id', verifyUser, verifyRole('admin', 'employee', 'moderator'), async (req, res) => {
	try {
		const deletedMessage = await ContactMessage.findByIdAndDelete(req.params.id);

		if (!deletedMessage) {
			return res.status(404).json({
				success: false,
				message: 'Message not found',
			});
		}

		res.json({
			success: true,
			message: 'Message deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting message:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete message',
		});
	}
});

module.exports = router;
