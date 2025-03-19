const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const useragent = require('useragent');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());
app.use(express.static('public'));

// User Schema
const UserData = mongoose.model('UserData', new mongoose.Schema({
    ip: String,
    userAgent: String,
    browser: String,
    os: String,
    location: Object,
    timestamp: { type: Date, default: Date.now }
}));

// Fetch Location Data
const fetchLocation = async (ip) => {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        return response.data;
    } catch {
        return { status: 'fail', message: 'Location not available' };
    }
};


// Track User Clicks
app.post('/track', async (req, res) => {
    try {
        const userIp = requestIp.getClientIp(req) || 'Unknown';
        const userAgent = req.get('User-Agent') || 'Unknown';
        const agent = useragent.parse(userAgent);
        const browserName = agent.toAgent();
        const os = agent.os.toString();

        const location = await fetchLocation(userIp);

        const newUserData = new UserData({
            ip: userIp,
            userAgent,
            browser: browserName,
            os,
            location
        });

        await newUserData.save();

        res.json({
            ip: userIp,
            browser: browserName,
            os,
            location
        });
    } catch (error) {
        console.error('❌ Error tracking user:', error);
        res.status(500).json({ status: 'error', message: 'Failed to track user.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
