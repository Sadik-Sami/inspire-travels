const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const visaRoutes = require('./routes/visaRoutes');

const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

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

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
