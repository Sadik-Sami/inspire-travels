const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const visaRoutes = require('./routes/visaRoutes');
const visaBookingRoutes = require('./routes/visaBookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const cronRoutes = require('./routes/cronRoutes');
const customerRoutes = require('./routes/customerRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const supportRoutes = require('./routes/supportRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Cors Options
const allowedOrigins = ['https://inspire-dev.netlify.app', 'http://localhost:5173'];
const corsOptions = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// connect to MongoDB
connectDB();

// Root Route
app.get('/', (req, res) => {
	res.send('Welcome to Inspire API');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/visa-bookings', visaBookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/cron', cronRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: 'Something went wrong!',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
