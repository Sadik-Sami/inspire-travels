const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');

dotenv.config();

// create app and configure middleware
const app = express();

// Enhanced CORS configuration for cross-origin cookies
const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		const allowedOrigins = [
			'http://localhost:5173',
			'http://localhost:3000',
			'https://inspire-self.vercel.app',
			'https://inspire-dev.netlify.app',
		];

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			console.log('Blocked by CORS:', origin);
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true, // Enable credentials (cookies, authorization headers, TLS client certificates)
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	exposedHeaders: ['Set-Cookie'],
	optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: 'Something went wrong!',
		error: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
	});
});
// Connect to MongoDB
const connectDB = require('./config/db');

// Routes
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const visaRoutes = require('./routes/visaRoutes');
const visaBookingRoutes = require('./routes/visaBookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactInfoRoutes = require('./routes/contactInfoRoutes');

const PORT = process.env.PORT || 3000;

// connect to MongoDB
connectDB();

// Entry point for the application
app.get('/', (req, res) => {
	res.send('Welcome to Inspire API');
});

app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/visa-bookings', visaBookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact-info', contactInfoRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
