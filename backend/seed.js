const mongoose = require('mongoose');
const User = require('./src/models/User');
const Quiz = require('./src/models/Quiz');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Create Admin
  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'AdminPassword123!',
      mobile: '9999999999',
      role: 'admin',
      firstLoginRequired: false
    });
    console.log('Admin user created: admin@example.com / AdminPassword123!');
  }

  // Create Sample Quiz for Today
  const today = new Date().setHours(0, 0, 0, 0);
  const existingQuiz = await Quiz.findOne({ activeDate: today });
  if (!existingQuiz) {
    await Quiz.create({
      title: 'Daily Leadership Assessment',
      description: 'Find out if you are In-Charge or In-Control today.',
      isActive: true,
      activeDate: today,
      questions: [
        {
          questionText: 'How do you handle a team conflict?',
          options: [
            { text: 'I take charge and decide the resolution.', type: 'In-Charge' },
            { text: 'I facilitate a discussion for them to resolve.', type: 'In-Control' },
            { text: 'I observe and intervene if necessary.', type: 'In-Control' },
            { text: 'I set strict boundaries for the team.', type: 'In-Control' }
          ]
        },
        // Adding 9 more simple questions to make it 10
        ...Array.from({ length: 9 }, (_, i) => ({
          questionText: `Sample Question ${i + 2}?`,
          options: [
            { text: 'Option In-Charge', type: 'In-Charge' },
            { text: 'Option In-Control 1', type: 'In-Control' },
            { text: 'Option In-Control 2', type: 'In-Control' },
            { text: 'Option In-Control 3', type: 'In-Control' }
          ]
        }))
      ]
    });
    console.log('Sample quiz created for today');
  }

  console.log('Seeding complete');
  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
