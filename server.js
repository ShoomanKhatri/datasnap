const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const UserData = require('./models/userData'); // Correct model import

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logs requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Health Check Route
app.get('/health', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            return res.status(200).json({ status: 'success', message: 'Server and database are running smoothly.' });
        }
        throw new Error("Database is not connected");
    } catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(500).json({ status: 'error', message: 'Database connection issue.' });
    }
});

// Track User Clicks (Change GET to POST)
app.post('/track', async (req, res) => {
    try {
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');

        const newUserData = new UserData({ ip: userIp, userAgent });
        await newUserData.save();

        console.log(`🔹 Tracked Click - IP: ${userIp}, User-Agent: ${userAgent}`);
        
        res.json({ status: "success", message: "User tracked successfully" });
    } catch (error) {
        console.error('❌ Error tracking user data:', error);
        res.status(500).json({ status: 'error', message: 'Failed to track the request.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
