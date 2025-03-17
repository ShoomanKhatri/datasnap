const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', () => console.log('✅ Connected to MongoDB successfully.'));
db.on('error', (err) => console.error('❌ MongoDB connection error:', err));
db.on('disconnected', () => console.warn('⚠️ MongoDB connection lost.'));

module.exports = mongoose;
