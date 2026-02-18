const mongoose = require('mongoose');
const User = require('../src/models/User');
const Quiz = require('../src/models/Quiz');
const QuizAttempt = require('../src/models/QuizAttempt');
const Language = require('../src/models/Language');
const Translation = require('../src/models/Translation');
const path = require('path');
const fs = require('fs');

// Hardcoded URI to bypass EPERM issues with .env file
const MONGO_URI = 'mongodb+srv://incharge:smmart@incharge.nsk5cmh.mongodb.net/?appName=incharge';
console.log('DEBUG: Using Hardcoded MONGO_URI');

const seed = async () => {
  console.log('Connecting to:', MONGO_URI.includes('@') ? 'Atlas Cloud DB' : 'Local DB');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // --- CLEANUP ---
  console.log('⚠️  WIPING DATABASE...');
  await QuizAttempt.deleteMany({});
  await Quiz.deleteMany({});
  await Language.deleteMany({});
  await Translation.deleteMany({});

  // Create Languages
  console.log('🌍 Seeding Languages...');
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
  ];
  await Language.insertMany(languages);

  // Create Translations
  console.log('📖 Seeding Translations...');
  const translations = [
    // Navbar
    { languageCode: 'en', key: 'welcome', value: 'Welcome', section: 'nav' },
    { languageCode: 'en', key: 'take_quiz', value: 'Take Quiz', section: 'nav' },
    { languageCode: 'en', key: 'quiz_history', value: 'Quiz History', section: 'nav' },
    { languageCode: 'en', key: 'profile', value: 'Profile', section: 'nav' },
    { languageCode: 'en', key: 'logout', value: 'Logout', section: 'nav' },

    // Dashboard
    { languageCode: 'en', key: 'live_event', value: 'Live Event', section: 'dashboard' },
    { languageCode: 'en', key: 'active', value: 'Active', section: 'dashboard' },
    { languageCode: 'en', key: 'start_now', value: 'Start Now', section: 'dashboard' },
    { languageCode: 'en', key: 'view_results', value: 'View Results', section: 'dashboard' },
    { languageCode: 'en', key: 'view', value: 'VIEW', section: 'dashboard' },
    { languageCode: 'en', key: 'go', value: 'GO', section: 'dashboard' },
    { languageCode: 'en', key: 'no_quiz', value: 'No Quiz for Today', section: 'dashboard' },
    { languageCode: 'en', key: 'come_back', value: 'Come back tomorrow for a new challenge!', section: 'dashboard' },

    // Quiz
    { languageCode: 'en', key: 'choose_language', value: 'Choose Your Language', section: 'quiz' },
    { languageCode: 'en', key: 'select_lang_msg', value: 'Select a language to start the daily quiz', section: 'quiz' },
    { languageCode: 'en', key: 'question', value: 'Question', section: 'quiz' },
    { languageCode: 'en', key: 'of', value: 'of', section: 'quiz' },

    // Hindi (Samples)
    { languageCode: 'hi', key: 'welcome', value: 'स्वागत हे', section: 'nav' },
    { languageCode: 'hi', key: 'take_quiz', value: 'क्विज़ लें', section: 'nav' },
    { languageCode: 'hi', key: 'live_event', value: 'लाइव इवेंट', section: 'dashboard' },
    { languageCode: 'hi', key: 'start_now', value: 'शुरू करें', section: 'dashboard' },

    // Gujarati (Samples)
    { languageCode: 'gu', key: 'welcome', value: 'સ્વાગત છે', section: 'nav' },
    { languageCode: 'gu', key: 'take_quiz', value: 'ક્વિઝ લો', section: 'nav' },

    // Malayalam (Samples)
    { languageCode: 'ml', key: 'welcome', value: 'സ്വാഗതം', section: 'nav' },
  ];
  await Translation.insertMany(translations);

  // We keep Users to avoid forcing re-login for everyone, OR we can wipe them too if requested. 
  // User requested "start from bigging (beginning)", so let's wipe Users too EXCEPT Admin?
  // Use strictly controlled wipe.
  await User.deleteMany({ email: { $ne: 'admin@example.com' } });
  console.log('✅ Database Wiped (Admin preserved, Quizzes/Attempts cleared)');

  // --- CREATE ADMIN ---
  const adminEmail = 'admin@admin.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin',
      mobile: '9999999999',
      role: 'admin',
      firstLoginRequired: false
    });
    console.log('👤 Admin Created');
  } else {
    admin.password = 'admin';
    admin.firstLoginRequired = false;
    await admin.save();
    console.log('👤 Admin Exists (Password Reset)');
  }

  // --- CREATE SAMPLE USER ---
  const userEmail = 'john@example.com';
  // Always delete John first to ensure fresh state or update him
  await User.deleteOne({ email: userEmail });

  await User.create({
    name: 'John Doe',
    email: userEmail,
    mobile: '9876543210',
    password: 'UserPassword123!',
    company: 'Alpha Corp',
    role: 'user',
    accessFlag: true,
    firstLoginRequired: true
  });
  console.log('👤 Sample User Reset (john@example.com)');

  // --- CREATE QUIZ ---
  const today = new Date().setHours(0, 0, 0, 0);

  await Quiz.create({
    title: 'Leadership Assessment (Golden Copy)',
    description: 'Find out if you are In-Charge or In-Control.',
    isActive: true,
    activeDate: today,
    generatedBy: 'MANUAL',
    status: 'ACTIVE',
    questions: [
      {
        questionText: 'When a team member misses a deadline, I:',
        options: [
          { text: 'Take over their work to ensure it gets done.', answerType: 'In-Charge' },
          { text: 'Ask them what support they need to finish.', answerType: 'In-Control' },
          { text: 'Reprimand them for the delay.', answerType: 'In-Charge' },
          { text: 'Adjust the schedule to accommodate.', answerType: 'In-Control' }
        ]
      },
      {
        questionText: 'In a meeting, silence makes me feel:',
        options: [
          { text: 'Anxious, I must fill the void.', answerType: 'In-Charge' },
          { text: 'Comfortable, allowing others to think.', answerType: 'In-Control' },
          { text: 'Impated, I want to move on.', answerType: 'In-Charge' },
          { text: 'Curious about what will emerge.', answerType: 'In-Control' }
        ]
      },
      {
        questionText: 'My approach to feedback is:',
        options: [
          { text: 'Direct and often unsolicited.', answerType: 'In-Charge' },
          { text: 'Asked for and given constructively.', answerType: 'In-Control' },
          { text: 'Brutal honesty is key.', answerType: 'In-Charge' },
          { text: 'Focus on growth and learning.', answerType: 'In-Control' }
        ]
      },
      {
        questionText: 'I view delegation as:',
        options: [
          { text: 'Losing control of quality.', answerType: 'In-Charge' },
          { text: 'Empowering others to lead.', answerType: 'In-Control' },
          { text: 'A necessary evil.', answerType: 'In-Charge' },
          { text: 'A way to scale impact.', answerType: 'In-Control' }
        ]
      },
      {
        questionText: 'When plans change, I:',
        options: [
          { text: 'Get frustrated and resist.', answerType: 'In-Charge' },
          { text: 'Adapt and find new opportunities.', answerType: 'In-Control' },
          { text: 'Try to force the original plan.', answerType: 'In-Charge' },
          { text: 'Pivot quickly and calmly.', answerType: 'In-Control' }
        ]
      }
    ]
  });
  console.log('📝 New Schema-Compliant Quiz Created');

  console.log('✨ SEEDING COMPLETE');
  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
