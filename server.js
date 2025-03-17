const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const UserData = require('./models/userData'); // Correct model import
const axios = require('axios');
const useragent = require('useragent'); // To parse the User-Agent string
const requestIp = require('request-ip'); // Extract real IP behind proxies

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logs requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Function to check if an IP is private
const isPrivateIP = (ip) => {
    return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(ip);
};

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

// Track User Clicks with Exact Location
app.post('/track', async (req, res) => {
    try {
        // Get the real IP address
        const userIp = requestIp.getClientIp(req);
        const ip = userIp ? userIp.split(',')[0].trim() : 'Unknown';

        // Get the user-agent from the request
        const userAgent = req.get('User-Agent');
        const agent = useragent.parse(userAgent);
        const browserName = agent.toAgent(); // Extract browser details
        const os = agent.os.toString(); // Extract OS details

        let location = { status: 'fail', message: 'Not available', query: ip };

        if (!isPrivateIP(ip) && ip !== 'Unknown') {
            try {
                // Fetch geolocation only for public IPs
                const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
                location = geoResponse.data;
            } catch (geoError) {
                console.error('🌍 Geolocation API Error:', geoError.message);
                location = { status: 'fail', message: 'Geo lookup failed', query: ip };
            }
        } else {
            // Mark private IPs
            location = { status: 'fail', message: 'private range', query: ip };
        }

        // Get client-side GPS location if available
        const clientLocation = req.body.clientLocation || null; // Expecting clientLocation from frontend

        // Save the tracking data to the database
        const newUserData = new UserData({
            ip: ip,
            userAgent: userAgent,
            browser: browserName,
            os: os,
            location: location,
            clientLocation: clientLocation, // Storing GPS-based location
            timestamp: new Date()
        });

        await newUserData.save();

        // Send response
        res.json({
            status: 'success',
            message: 'User tracked successfully',
            location: location,
            clientLocation: clientLocation,
            browser: browserName,
            os: os
        });
    } catch (error) {
        console.error('❌ Error tracking user data:', error);
        
        // Save failed tracking attempts too
        const failedData = new UserData({
            ip: 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown',
            browser: 'Unknown',
            os: 'Unknown',
            location: { status: 'fail', message: 'Error tracking' },
            timestamp: new Date()
        });

        await failedData.save(); // Save failed attempts
        
        res.status(500).json({ status: 'error', message: 'Failed to track the request.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
