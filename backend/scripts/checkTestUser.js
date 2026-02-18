const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';

const checkUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            console.log('User not found');
        } else {
            console.log(`User: ${user.name}`);
            console.log(`Mobile: ${user.mobile}`);
            console.log(`Generated Password Should Be: ${user.name.substring(0, 2).toUpperCase()}${user.mobile.toString().slice(-4)}`);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
