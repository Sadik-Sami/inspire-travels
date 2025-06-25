const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');
const { verifyUser, verifyRole } = require('../middlewares/authMiddleware');

// GET: Fetch the single contact info document
// If it doesn't exist, create a default one.
router.get('/', async (req, res) => {
	try {
		let contactInfo = await ContactInfo.findOne();
		if (!contactInfo) {
			contactInfo = new ContactInfo();
			await contactInfo.save();
		}
		res.status(200).json({ success: true, data: contactInfo });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to fetch contact info', error: error.message });
	}
});

// PUT: Update the contact info document
router.put('/', verifyUser, verifyRole('admin'), async (req, res) => {
	console.log('We address the PUT request to update contact info');
	try {
		const contactInfo = await ContactInfo.findOne();
		if (!contactInfo) {
			return res.status(404).json({ success: false, message: 'Contact info document not found.' });
		}

		const updates = req.body;
		updates.lastUpdatedBy = req.user._id;

		const updatedContactInfo = await ContactInfo.findByIdAndUpdate(contactInfo._id, updates, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			message: 'Contact information updated successfully.',
			data: updatedContactInfo,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to update contact info', error: error.message });
	}
});

module.exports = router;
