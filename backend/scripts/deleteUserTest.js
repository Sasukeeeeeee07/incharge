const mongoose = require('mongoose');
const User = require('../src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Find John Doe
        const user = await User.findOne({ email: 'john@example.com' });
        if (!user) {
            console.log('User John Doe not found.');
            process.exit(0);
        }

        console.log('Found user:', user.name, user.email, user._id);

        try {
            await User.findByIdAndDelete(user._id);
            console.log('Successfully deleted user via script.');
        } catch (err) {
            console.error('Error deleting user:', err);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('DB Connection Error:', err);
        process.exit(1);
    });
