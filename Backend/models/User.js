const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			match: [/\S+@\S+\.\S+/, 'Email is invalid'],
		},
		phone: {
			type: String,
			required: [true, 'Phone number is required'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Password must be at least 8 characters'],
		},
		role: {
			type: String,
			enum: ['customer', 'admin', 'moderator', 'employee'],
			default: 'customer',
		},
		refreshTokens: [
			{
				token: { type: String },
				expiresAt: { type: Date },
				userAgent: { type: String },
				createdAt: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Compare entered password with stored hash
UserSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
