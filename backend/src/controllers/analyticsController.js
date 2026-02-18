const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');

const getAnalytics = async (req, res) => {
  try {
    const {
      role,
      search,
      startDate,
      endDate,
      language,
      onlyAttempted = 'true' // Default to true as per request to "show only the user who have given the test"
    } = req.query;

    // 1. Fetch Users (Apply Search Filter)
    const userQuery = { role: { $ne: 'admin' } };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(userQuery).select('-password');

    // 2. Fetch Attempts (Apply Date & Language Filters)
    const attemptQuery = {};
    if (startDate || endDate) {
      attemptQuery.completedAt = {};
      if (startDate) attemptQuery.completedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        attemptQuery.completedAt.$lte = end;
      }
    }
    if (language && language !== 'all') {
      attemptQuery.language = language;
    }

    const attempts = await QuizAttempt.find(attemptQuery).sort({ completedAt: -1 });

    // Group attempts by user
    const userAttemptsMap = new Map();
    attempts.forEach(att => {
      if (!userAttemptsMap.has(att.userId.toString())) {
        userAttemptsMap.set(att.userId.toString(), []);
      }
      userAttemptsMap.get(att.userId.toString()).push(att);
    });

    // 3. Map Users to Data & Apply Logic
    let filteredUsers = users.map(user => {
      const userAttempts = userAttemptsMap.get(user._id.toString()) || [];
      // If we filtered attempts (e.g. by date), a user might have No attempts *in that range*, 
      // even if they have attempts overall. 

      if (userAttempts.length === 0) {
        return {
          ...user.toObject(),
          latestAttempt: null,
          userType: 'Unassessed',
          attemptCount: 0
        };
      }

      const latestAttempt = userAttempts[0]; // Already sorted desc

      const counts = { 'In-Charge': 0, 'In-Control': 0, 'Balanced': 0 };
      userAttempts.forEach(att => {
        if (att.result && counts[att.result] !== undefined) {
          counts[att.result]++;
        }
      });

      let aggregateResult = 'Unassessed';

      // Special Case: Equal In-Charge and In-Control implies Balanced
      if (counts['In-Charge'] > 0 && counts['In-Charge'] === counts['In-Control']) {
        aggregateResult = 'Balanced';
      } else {
        // Find the result with the max count
        let maxCount = -1;
        ['In-Charge', 'In-Control', 'Balanced'].forEach(type => {
          if (counts[type] > maxCount) {
            maxCount = counts[type];
            aggregateResult = type;
          }
        });
        if (maxCount === 0) aggregateResult = 'Unassessed';
      }

      return {
        ...user.toObject(),
        latestAttempt: latestAttempt,
        userType: aggregateResult,
        attemptCount: userAttempts.length
      };
    });

    // Filter by Role Query
    if (role && role !== 'all' && role !== 'mixed') {
      const targetType = role === 'incharge' ? 'In-Charge' : (role === 'incontrol' ? 'In-Control' : null);
      if (targetType) {
        filteredUsers = filteredUsers.filter(u => u.userType === targetType);
      }
    }

    // Filter "Only Attempted"
    if (onlyAttempted === 'true') {
      filteredUsers = filteredUsers.filter(u => u.attemptCount > 0);
    }

    // 4. Stats Aggregation (Based on attempts of the filtered users)
    const totalUsers = filteredUsers.length;
    const filteredUserIds = new Set(filteredUsers.map(u => u._id.toString()));

    // Filter attempts to only include those belonging to the selected users
    const relevantAttempts = attempts.filter(att => filteredUserIds.has(att.userId.toString()));

    let totalInChargeScore = 0;
    let totalQuestions = 0;
    let totalInControlScore = 0;

    relevantAttempts.forEach(att => {
      const inCharge = att.score?.inCharge || 0;
      const inControl = att.score?.inControl || 0;
      totalInChargeScore += inCharge;
      totalInControlScore += inControl;
      totalQuestions += (inCharge + inControl);
    });

    // Accuracy %
    const inChargeAccuracy = totalQuestions ? (totalInChargeScore / totalQuestions) * 100 : 0;
    const inControlAccuracy = totalQuestions ? (totalInControlScore / totalQuestions) * 100 : 0;

    // 5. Charts Data
    // ... (Charts data logic unchanged) ...
    // Note: I am skipping re-writing the charts logic to keep diff small, 
    // assuming steps A, B, C don't crash (they use dates/results which are safer or fixed above)

    // A. Daily Activity (Last 30 Days OR Selected Range if smaller)
    const dailyActivity = [];
    const dateMap = new Map();

    // If date range is provided, use that. Else default to 30 days.
    let rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - 30);
    if (startDate) rangeStart = new Date(startDate);

    let rangeEnd = new Date();
    if (endDate) rangeEnd = new Date(endDate);

    const dayDiff = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
    if (dayDiff < 60) {
      for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dateMap.set(dateStr, 0);
      }
    }

    relevantAttempts.forEach(att => {
      if (!att.completedAt) return;
      const dateStr = new Date(att.completedAt).toISOString().split('T')[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
    });

    Array.from(dateMap.keys()).sort().forEach(date => {
      dailyActivity.push({ date, count: dateMap.get(date) });
    });

    // B. Role Distribution
    const roleDist = [
      { name: 'In-Charge', value: 0, fill: '#a855f7' },
      { name: 'In-Control', value: 0, fill: '#f43f5e' },
      { name: 'Balanced', value: 0, fill: '#22c55e' },
      { name: 'Unassessed', value: 0, fill: '#94a3b8' }
    ];

    filteredUsers.forEach(u => {
      const item = roleDist.find(r => r.name === u.userType);
      if (item) item.value++;
    });

    const roleDistribution = roleDist.filter(item => item.value > 0);

    // C. Language Distribution
    const langCounts = {};
    relevantAttempts.forEach(att => {
      const lang = att.language || 'english';
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });

    const languageDistribution = Object.keys(langCounts).map(lang => ({
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      attempts: langCounts[lang]
    }));

    // D. Top 5 Users
    const topUsersData = filteredUsers
      .map(u => {
        const userAttempts = userAttemptsMap.get(u._id.toString()) || [];
        if (userAttempts.length === 0) return null;

        let totalInCharge = 0;
        userAttempts.forEach(att => {
          totalInCharge += (att.score?.inCharge || 0);
        });

        return {
          name: u.name,
          score: totalInCharge,
          type: u.userType
        };
      })
      .filter(u => u)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // 6. Table Data
    const usersTable = filteredUsers.map(u => {
      const scoreInCharge = u.latestAttempt?.score?.inCharge || 0;
      const scoreInControl = u.latestAttempt?.score?.inControl || 0;
      const totalScore = scoreInCharge + scoreInControl || 1; // Avoid div by zero

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        company: u.company,
        score: u.latestAttempt ? `${scoreInCharge}/${scoreInControl}` : 'N/A',
        accuracy: u.latestAttempt ? `${Math.max((scoreInCharge / totalScore) * 100, (scoreInControl / totalScore) * 100).toFixed(0)}%` : '-',
        lastQuizDate: u.latestAttempt?.completedAt || '-',
        result: u.userType,
        attemptCount: u.attemptCount
      };
    });

    res.json({
      stats: {
        totalUsers,
        totalInChargeScore,
        totalQuestions,
        inChargeAccuracy,
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

      const selectedOption = question.options.find(opt => opt.answerType === resp.answerType);

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
