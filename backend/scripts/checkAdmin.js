const mongoose = require('mongoose');
const User = require('../src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const admin = await User.findOne({ email: 'admin@admin.com' });
        if (admin) {
            console.log('Admin found:', admin.email);
            console.log('firstLoginRequired:', admin.firstLoginRequired);
            console.log('Role:', admin.role);
        } else {
            console.log('Admin NOT found!');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
