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

    // 3. Stats Aggregation
    const totalUsers = filteredUsers.length;
    
    let totalInChargeScore = 0;
    let totalInControlScore = 0;
    let attemptedCount = 0;

    filteredUsers.forEach(u => {
      if (u.latestAttempt) {
        totalInChargeScore += u.latestAttempt.score.inCharge;
        totalInControlScore += u.latestAttempt.score.inControl;
        attemptedCount++;
      }
    });

    const avgInCharge = attemptedCount ? (totalInChargeScore / attemptedCount) : 0;
    const avgInControl = attemptedCount ? (totalInControlScore / attemptedCount) : 0;

    // Accuracy % (Assuming 10 questions total)
    const inChargeAccuracy = (avgInCharge / 10) * 100;
    const inControlAccuracy = (avgInControl / 10) * 100;

    // 4. Charts Data

    // A. User Growth (Last 30 Days) - Based on Registration Date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = [];
    const dateMap = new Map();

    // Initialize map for last 30 days
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dateMap.set(dateStr, 0);
    }

    // Count (using filtered users or ALL users? Usually User Growth is global, but let's stick to filtered context if implied, but typically Growth is for the platform. Let's use ALL users for Growth chart to make it useful, OR filtered if the user strictly wants "InCharge Growth". Let's use Filtered for consistency.)
    filteredUsers.forEach(u => {
        const dateStr = u.createdAt.toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
            dateMap.set(dateStr, dateMap.get(dateStr) + 1);
        }
    });

    // Convert map to array (sorted)
    Array.from(dateMap.keys()).sort().forEach(date => {
        userGrowth.push({ date, count: dateMap.get(date) });
    });

    // B. Role Distribution (Pie Chart)
    const roleDist = [
        { name: 'In-Charge', value: 0, fill: '#6366f1' },
        { name: 'In-Control', value: 0, fill: '#a855f7' },
        { name: 'Balanced', value: 0, fill: '#22c55e' },
        { name: 'Unassessed', value: 0, fill: '#94a3b8' }
    ];

    filteredUsers.forEach(u => {
        const type = u.userType || 'Unassessed';
        const item = roleDist.find(r => r.name === type);
        if (item) item.value++;
    });

    const roleDistribution = roleDist.filter(item => item.value > 0);

    // C. Accuracy Comparison (Bar Chart)
    const accuracyData = [
        { name: 'Average Scores', InCharge: avgInCharge.toFixed(1), InControl: avgInControl.toFixed(1) }
    ];

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

    // 5. Table Data (Paginated handled by frontend usually, but we send full list for now if small, or paginate here. User said "Paginated", but strict backend pagination requires page/limit params. I'll send all for now as dataset is likely small, or implementing basic limitation is better. Let's send all and let frontend paginate or implement slice.)
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
        avgScore: (avgInCharge + avgInControl) / 2, // Overall average points? Or just InCharge? Let's send both or average.
        inChargeAccuracy,
        inControlAccuracy
      },
      userGrowth,
      roleDistribution,
      accuracyData,
      topUsers: topUsersData,
      usersTable
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Analytics Error' });
  }
};

module.exports = { getAnalytics };
