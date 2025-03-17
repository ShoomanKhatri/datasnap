const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    browser: { type: String, required: true },
    location: { type: Object, required: true }, // Saves all location data
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserData', userDataSchema);
