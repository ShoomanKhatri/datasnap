const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const userData = require('./models/userData');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Log requests to console
app.use(express.static(path.join(__dirname, 'public')));

// Health Check Route
app.get('/health', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.status(200).json({ status: 'success', message: 'Server and database are running smoothly.' });
    } catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(500).json({ status: 'error', message: 'Database connection issue.' });
    }
});

// Track User Clicks
app.get('/track', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');

        const userData = new userData({ ip: userIp, userAgent });
        await userData.save();

        console.log(`🔹 Tracked Click - IP: ${userIp}, User-Agent: ${userAgent}`);

        // Redirect to the actual photo
        res.redirect('/image.png'); // Image in public folder
    } catch (error) {
        console.error('❌ Error tracking user data:', error);
        res.status(500).json({ status: 'error', message: 'Failed to track the request.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
