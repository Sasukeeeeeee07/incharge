const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');

const getAnalytics = async (req, res) => {
  try {
    const { role } = req.query; // 'incharge', 'incontrol', 'mixed', 'all'
    
    // 1. Fetch Users and Attempts
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password'); // Exclude admins from stats? User didn't specify, but usually analytics is for end-users.
    
    // Get latest attempt for each user
    const attempts = await QuizAttempt.find().sort({ completedAt: -1 });
    const latestAttemptsMap = new Map();
    
    attempts.forEach(att => {
      if (!latestAttemptsMap.has(att.userId.toString())) {
        latestAttemptsMap.set(att.userId.toString(), att);
      }
    });

    // 2. Map Users to Data & Apply Filter
    let filteredUsers = users.map(user => {
      const attempt = latestAttemptsMap.get(user._id.toString());
      return {
        ...user.toObject(),
        latestAttempt: attempt || null,
        userType: attempt ? attempt.result : 'Unassessed'
      };
    });

    if (role && role !== 'all' && role !== 'mixed') {
      const targetType = role === 'incharge' ? 'In-Charge' : (role === 'incontrol' ? 'In-Control' : null);
      if (targetType) {
        filteredUsers = filteredUsers.filter(u => u.userType === targetType);
      }
    }

    // 3. Stats Aggregation (Based on ALL attempts of the filtered users)
    const totalUsers = filteredUsers.length;
    const filteredUserIds = new Set(filteredUsers.map(u => u._id.toString()));
    
    // Filter attempts to only include those belonging to the selected users
    const relevantAttempts = attempts.filter(att => filteredUserIds.has(att.userId.toString()));
    
    let totalInChargeScore = 0;
    let totalQuestions = 0;
    let totalInControlScore = 0;

    relevantAttempts.forEach(att => {
        const inCharge = att.score.inCharge || 0;
        const inControl = att.score.inControl || 0;
        totalInChargeScore += inCharge;
        totalInControlScore += inControl;
        totalQuestions += (inCharge + inControl);
    });

    // Accuracy %
    const inChargeAccuracy = totalQuestions ? (totalInChargeScore / totalQuestions) * 100 : 0;
    const inControlAccuracy = totalQuestions ? (totalInControlScore / totalQuestions) * 100 : 0;

    // 4. Charts Data

    // A. Daily Activity (Last 30 Days) - Based on Quiz Attempts
    const dailyActivity = [];
    const dateMap = new Map();

    // Initialize map for last 30 days
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dateMap.set(dateStr, 0);
    }

    // Count attempts per day based on filtered/relevant attempts
    relevantAttempts.forEach(att => {
        const dateStr = new Date(att.completedAt).toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
            dateMap.set(dateStr, dateMap.get(dateStr) + 1);
        }
    });

    // Convert map to array (sorted)
    Array.from(dateMap.keys()).sort().forEach(date => {
        dailyActivity.push({ date, count: dateMap.get(date) });
    });

    // B. Role Distribution (Pie Chart) - Based on ALL attempts
    const roleDist = [
        { name: 'In-Charge', value: 0, fill: '#a855f7' }, // Purple (was In-Control's)
        { name: 'In-Control', value: 0, fill: '#f43f5e' }, // Red
        { name: 'Balanced', value: 0, fill: '#22c55e' },
        { name: 'Unassessed', value: 0, fill: '#94a3b8' }
    ];

    relevantAttempts.forEach(att => {
        const type = att.result || 'Unassessed';
        const item = roleDist.find(r => r.name === type);
        if (item) item.value++;
    });

    const roleDistribution = roleDist.filter(item => item.value > 0);

    // C. Language Distribution (Bar Chart)
    const langCounts = {};
    attempts.forEach(att => {
        const lang = att.language || 'english';
        langCounts[lang] = (langCounts[lang] || 0) + 1;
    });

    const languageDistribution = Object.keys(langCounts).map(lang => ({
        name: lang.charAt(0).toUpperCase() + lang.slice(1),
        attempts: langCounts[lang]
    }));

    // D. Top 5 Users (by In-Charge Score desc, then In-Control)
    // Or just "Score" meaning "Highest Score in their dominant trait"
    const topUsersData = filteredUsers
        .filter(u => u.latestAttempt)
        .map(u => ({
            name: u.name,
            score: Math.max(u.latestAttempt.score.inCharge, u.latestAttempt.score.inControl),
            type: u.userType
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    // 5. Table Data
    const usersTable = filteredUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        score: u.latestAttempt ? `${u.latestAttempt.score.inCharge}/${u.latestAttempt.score.inControl}` : 'N/A',
        accuracy: u.latestAttempt ? `${Math.max((u.latestAttempt.score.inCharge/10)*100, (u.latestAttempt.score.inControl/10)*100).toFixed(0)}%` : '-',
        lastQuizDate: u.latestAttempt ? u.latestAttempt.completedAt : '-',
        result: u.userType
    }));

    res.json({
      stats: {
        totalUsers,
        totalInChargeScore,
        totalQuestions,
        inChargeAccuracy,
        inControlAccuracy
      },
      dailyActivity,
      roleDistribution,
      languageDistribution,
      topUsers: topUsersData,
      usersTable
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Analytics Error' });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const history = await QuizAttempt.find({ userId })
      .populate('quizId', 'title')
      .sort({ completedAt: -1 });

    const formattedHistory = history.map(att => ({
      id: att._id,
      quizTitle: att.quizId?.title || 'General Quiz',
      score: {
        inCharge: att.score.inCharge,
        inControl: att.score.inControl
      },
      result: att.result,
      language: att.language,
      completedAt: att.completedAt
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
};

const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findById(attemptId).populate('quizId');
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const quiz = attempt.quizId;
    const lang = attempt.language || 'english';
    
    // Get questions for the used language
    const quizContent = quiz.content instanceof Map ? quiz.content.get(lang) : quiz.content[lang];
    const questions = quizContent?.questions || quiz.questions || [];

    const details = attempt.responses.map(resp => {
      const question = questions.find(q => q._id.toString() === resp.questionId.toString());
      if (!question) return null;

      const selectedOption = question.options.find(opt => opt.type === resp.answerType);
      
      return {
        questionText: question.questionText,
        selectedAnswer: selectedOption?.text || 'Unknown',
        answerType: resp.answerType
      };
    }).filter(d => d !== null);

    res.json({
      quizTitle: quizContent?.title || quiz.title,
      result: attempt.result,
      score: attempt.score,
      totalQuestions: details.length,
      completedAt: attempt.completedAt,
      details
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
};

module.exports = { getAnalytics, getUserHistory, getAttemptDetails };
