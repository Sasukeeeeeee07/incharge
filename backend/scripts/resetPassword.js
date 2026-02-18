const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';

const resetPassword = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        // Hash the password manually or rely on pre-save hook?
        // The User model has a pre-save hook that hashes the password if modified.
        // So simply setting it to '123456' and saving should trigger hashing.
        user.password = '123456';
        await user.save();
        console.log('Password updated successfully for test@example.com');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
