import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, CheckCircle, TrendingUp, AlertCircle, RefreshCw, Filter } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#22c55e', '#94a3b8'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'incharge', 'incontrol', 'mixed' (using 'all' as mixed/default)
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/analytics?role=${filter}`, {
        headers: { Authorization: token }
      });
      setData(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const fetchUserHistory = async (user) => {
    setSelectedUser(user);
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/users/${user.id}/history`, {
        headers: { Authorization: token }
      });
      setUserHistory(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAttemptDetails = async (attemptId) => {
    setLoadingDetails(true);
    setSelectedAttempt(attemptId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/attempts/${attemptId}/details`, {
        headers: { Authorization: token }
      });
      setAttemptDetails(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch attempt details');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading && !data) return <div className="p-5 text-text-secondary">Loading analytics...</div>;
  if (error) return <div className="p-5 text-error">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header & Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <Filter size={16} className="text-text-secondary" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-text-primary outline-none cursor-pointer min-w-[120px] text-sm font-medium"
            >
              <option value="all" className="bg-bg-secondary">All Users</option>
              <option value="incharge" className="bg-bg-secondary">In-Charge Only</option>
              <option value="incontrol" className="bg-bg-secondary">In-Control Only</option>
            </select>
          </div>
          
          <button 
            onClick={fetchAnalytics} 
            className="btn-primary px-3 py-2 text-sm" 
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Users" 
          value={data.stats.totalUsers} 
          icon={<Users size={24} color="#6366f1" />} 
        />
        <StatCard 
          title="Total Score (In-Charge)" 
          value={data.stats.totalInChargeScore || '0'} 
          icon={<TrendingUp size={24} color="#22c55e" />} 
          subtext={`Out of ${data.stats.totalQuestions || '0'}`}
        />
        <StatCard 
          title="In-Charge Accuracy" 
          value={`${data.stats.inChargeAccuracy?.toFixed(1)}%`} 
          icon={<CheckCircle size={24} color="#a855f7" />} 
        />
        <StatCard 
          title="In-Control Accuracy" 
          value={`${data.stats.inControlAccuracy?.toFixed(1)}%`} 
          icon={<CheckCircle size={24} color="#f43f5e" />} 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Activity */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Daily Quiz Activity (30 Days)</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyActivity}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} 
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Role Distribution</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.roleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Language Distribution */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Language Distribution</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.languageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="attempts" fill="#6366f1" radius={[4, 4, 0, 0]} name="Quiz Attempts" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Top Users */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Top 5 Performers</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topUsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold">User Performance</h3>
        </div>
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/[0.05]">
          {data.usersTable.map((user) => (
            <div 
              key={user.id} 
              className="p-4 space-y-3 active:bg-white/[0.05] cursor-pointer"
              onClick={() => fetchUserHistory(user)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-text-primary">{user.name}</div>
                  <div className="text-xs text-text-secondary">{user.email}</div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  user.result === 'In-Charge' ? 'bg-blue-500/20 text-blue-400' : 
                  user.result === 'In-Control' ? 'bg-orange-500/20 text-orange-400' : 
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {user.result || 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <div className="text-text-secondary text-[11px] uppercase font-semibold">Score</div>
                  <div className="text-text-primary font-medium">{user.score}</div>
                </div>
                <div>
                  <div className="text-text-secondary text-[11px] uppercase font-semibold">Accuracy</div>
                  <div className="text-text-primary font-medium">{user.accuracy}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-text-secondary text-[11px] uppercase font-semibold">Last Quiz</div>
                  <div className="text-text-primary font-medium">
                    {user.lastQuizDate !== '-' ? new Date(user.lastQuizDate).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/[0.02] text-text-secondary border-b border-white/[0.08]">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Score (Charge/Control)</th>
                <th className="p-4 font-semibold">Result</th>
                <th className="p-4 font-semibold">Accuracy</th>
                <th className="p-4 font-semibold">Last Quiz</th>
              </tr>
            </thead>
            <tbody>
              {data.usersTable.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => fetchUserHistory(user)}
                >
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-text-secondary">{user.email}</td>
                  <td className="p-4">{user.score}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      user.result === 'In-Charge' ? 'bg-blue-500/20 text-blue-400' : 
                      user.result === 'In-Control' ? 'bg-orange-500/20 text-orange-400' : 
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.result || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">{user.accuracy}</td>
                  <td className="p-4 text-text-secondary">
                    {user.lastQuizDate !== '-' ? new Date(user.lastQuizDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border-white/[0.1]">
            <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-bold">Quiz History</h3>
                <p className="text-sm text-text-secondary">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors font-bold text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                  <p>Loading history...</p>
                </div>
              ) : userHistory.length > 0 ? (
                <div className="space-y-4">
                  {userHistory.map((attempt) => (
                    <div 
                      key={attempt.id} 
                      className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.06] transition-all group"
                      onClick={() => fetchAttemptDetails(attempt.id)}
                    >
                      <div>
                        <div className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{attempt.quizTitle}</div>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                          <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className="capitalize">{attempt.language}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-0.5">Score</div>
                          <div className="font-mono text-lg">{attempt.score.inCharge}/{attempt.score.inControl}</div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg ${
                          attempt.result === 'In-Charge' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
                          attempt.result === 'In-Control' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 
                          'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                        }`}>
                          {attempt.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No quiz attempts found for this user.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attempt Details Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="glass-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-white/[0.15]">
            <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.03]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedAttempt(null); setAttemptDetails(null); }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-text-primary"
                >
                  <RefreshCw size={20} className="rotate-180" /> {/* Using RefreshCw as a back arrow since I don't have ArrowLeft imported, or I can just use a string */}
                </button>
                <div>
                  <h3 className="text-xl font-bold">Detailed Results</h3>
                  <p className="text-sm text-text-secondary">
                    {attemptDetails ? `${attemptDetails.quizTitle} - ${new Date(attemptDetails.completedAt).toLocaleDateString()}` : 'Loading...'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedAttempt(null); setAttemptDetails(null); }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors font-bold text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
                  <RefreshCw size={32} className="animate-spin text-primary" />
                  <p>Analyzing responses...</p>
                </div>
              ) : attemptDetails ? (
                <>
                  {/* Summary Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/[0.05] p-4 rounded-2xl border border-white/[0.05]">
                      <div className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mb-1">Result</div>
                      <div className={`text-lg font-bold ${
                        attemptDetails.result === 'In-Charge' ? 'text-blue-400' : 
                        attemptDetails.result === 'In-Control' ? 'text-orange-400' : 'text-slate-400'
                      }`}>{attemptDetails.result}</div>
                    </div>
                    <div className="bg-white/[0.05] p-4 rounded-2xl border border-white/[0.05]">
                      <div className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mb-1">In-Charge Score</div>
                      <div className="text-lg font-bold">{attemptDetails.score.inCharge}/{attemptDetails.totalQuestions}</div>
                    </div>
                    <div className="bg-white/[0.05] p-4 rounded-2xl border border-white/[0.05]">
                      <div className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mb-1">In-Control Score</div>
                      <div className="text-lg font-bold">{attemptDetails.score.inControl}/{attemptDetails.totalQuestions}</div>
                    </div>
                  </div>

                  {/* Question List */}
                  <div className="space-y-4">
                    {attemptDetails.details.map((item, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:border-white/[0.1] transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="bg-white/5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-text-secondary shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-text-primary font-medium leading-relaxed mb-3">{item.questionText}</h4>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs text-text-secondary">Selected:</span>
                              <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                                item.answerType === 'In-Charge' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 
                                'bg-orange-500/10 border-orange-500/20 text-orange-300'
                              }`}>
                                {item.selectedAnswer}
                              </div>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                item.answerType === 'In-Charge' ? 'text-blue-500/60 border-blue-500/20' : 
                                'text-orange-500/60 border-orange-500/20'
                              }`}>
                                {item.answerType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, subtext }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className="bg-white/5 p-3 rounded-2xl flex items-center justify-center h-12 w-12">
      {icon}
    </div>
    <div>
      <div className="text-text-secondary text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold mt-1 text-white">{value}</div>
      {subtext && <div className="text-xs text-text-secondary mt-0.5">{subtext}</div>}
    </div>
  </div>
);

export default AnalyticsDashboard;
