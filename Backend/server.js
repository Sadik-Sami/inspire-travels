const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// create app and configure middleware
const app = express();
app.use(express.json());
app.use(cors());
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

dotenv.config();

const PORT = process.env.PORT || 3000;
// connect to MongoDB
connectDB();

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

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
