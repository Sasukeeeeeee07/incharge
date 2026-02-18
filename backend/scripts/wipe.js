const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const wipe = async () => {
    if (!MONGO_URI) {
        console.error('MONGO_URI is not defined in .env');
        process.exit(1);
    }

    try {
        console.log(`Connecting to ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('Connected. Wiping database...');

        const collections = await mongoose.connection.db.collections();

        for (const collection of collections) {
            console.log(`Dropping collection: ${collection.collectionName}`);
            await collection.drop();
        }

        console.log('✅ Database wiped successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error wiping database:', error);
        process.exit(1);
    }
};

wipe();
