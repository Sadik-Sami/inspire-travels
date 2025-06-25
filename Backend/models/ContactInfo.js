const mongoose = require('mongoose');

const ContactInfoSchema = new mongoose.Schema(
	{
		companyName: {
			type: String,
			trim: true,
			default: 'SureTrip Travels',
		},
		address: {
			street: { type: String, trim: true },
			city: { type: String, trim: true },
			state: { type: String, trim: true },
			zipCode: { type: String, trim: true },
			country: { type: String, trim: true },
		},
		phoneNumbers: [
			{
				label: { type: String, trim: true, default: 'Main' }, // e.g., Main, Sales, Support
				number: { type: String, trim: true, required: true },
			},
		],
		emailAddresses: [
			{
				label: { type: String, trim: true, default: 'General' }, // e.g., General, Support, Sales
				email: { type: String, trim: true, required: true, lowercase: true },
			},
		],
		websiteUrl: {
			type: String,
			trim: true,
		},
		socialMediaLinks: {
			facebook: { type: String, trim: true },
			twitter: { type: String, trim: true },
			instagram: { type: String, trim: true },
			linkedin: { type: String, trim: true },
			youtube: { type: String, trim: true },
		},
		mapEmbedUrl: {
			type: String,
			trim: true,
			// Example: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
		},
		officeHours: [
			{
				days: { type: String, trim: true, required: true }, // e.g., "Monday - Friday", "Saturday"
				hours: { type: String, trim: true, required: true }, // e.g., "9:00 AM - 6:00 PM", "10:00 AM - 2:00 PM"
			},
		],
		termsAndConditions: [
			{
				title: { type: String, trim: true, required: true },
				content: { type: String, trim: true, required: true },
			},
		],
		additionalInfo: {
			type: String,
			trim: true,
		},
		// To ensure only one contact info document exists, you could use a unique key.
		// For simplicity, we'll assume application logic handles fetching/updating the single document.
		// Alternatively, you could add a field like:
		// uniqueIdentifier: {
		//   type: String,
		//   default: 'main_contact_info',
		//   unique: true,
		//   required: true,
		// },
		lastUpdatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ContactInfo', ContactInfoSchema);
