import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/analytics?role=all`, {
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
  }, []);

  if (loading && !data) return <div className="p-5 text-text-secondary">Loading analytics...</div>;
  if (error) return <div className="p-5 text-error">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        <div className="flex items-center gap-3">
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
          title="Total In-Charge" 
          value={data.stats.totalInChargeScore || '0'} 
          icon={<TrendingUp size={24} color="#f43f5e" />} 
          subtext="Cumulative points"
        />
        <StatCard 
          title="Total In-Control" 
          value={data.stats.totalInControlScore || '0'} 
          icon={<TrendingUp size={24} color="#3b82f6" />} 
          subtext="Cumulative points"
        />
        <StatCard 
          title="Total Points" 
          value={data.stats.totalQuestions || '0'} 
          icon={<CheckCircle size={24} color="#a855f7" />} 
          subtext="Across all attempts"
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
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
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
