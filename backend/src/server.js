const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const { initScheduler } = require('./services/schedulerService');

// Initialize Scheduler
initScheduler();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
