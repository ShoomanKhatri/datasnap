const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserData', userDataSchema);
