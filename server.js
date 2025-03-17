const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const UserData = require('./models/userData'); // Correct model import
const axios = require('axios');
const useragent = require('useragent'); // To parse the User-Agent string

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

        // Parse user-agent to get browser and device info
        const agent = useragent.parse(userAgent);
        const browserName = agent.toAgent(); // Browser name

        // Get Geolocation of the IP
        const ip = userIp.split(',')[0]; // If there are multiple IPs, use the first one
        const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
        const location = geoResponse.data;

        // Create a new user data entry
        const newUserData = new UserData({
            ip: userIp,
            userAgent: userAgent,
            browser: browserName,
            location: location,
            timestamp: new Date()
        });

        await newUserData.save();

        console.log(`🔹 Tracked Click - IP: ${userIp}, Browser: ${browserName}, Location: ${location.city}, ${location.country}`);

        // Respond with success
        res.json({
            status: 'success',
            message: 'User tracked successfully',
            location: location,
            browser: browserName
        });
    } catch (error) {
        console.error('❌ Error tracking user data:', error);
        res.status(500).json({ status: 'error', message: 'Failed to track the request.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
