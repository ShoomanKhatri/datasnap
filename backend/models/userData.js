const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    browser: String,
    os: String,
    location: Object, // IP-based location
    clientLocation: Object, // GPS-based location from frontend
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserData', userDataSchema);
