const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;

console.log('Current working directory:', process.cwd());
console.log('MONGO_URI found:', !!MONGO_URI);

if (!MONGO_URI) {
    console.error('MONGO_URI is undefined. Content of .env:');
    try {
        console.log(fs.readFileSync(envPath, 'utf8'));
    } catch (e) {
        console.error('Could not read .env:', e.message);
    }
    process.exit(1);
}

// Mask password for safety in logs
const maskedURI = MONGO_URI.replace(/:([^@]+)@/, ':****@');
console.log('Testing connection to:', maskedURI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
