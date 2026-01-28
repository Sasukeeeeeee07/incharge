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

  if (loading && !data) return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>Loading analytics...</div>;
  if (error) return <div style={{ color: 'var(--error)', padding: '20px' }}>{error}</div>;

  return (
    <div className="analytics-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Analytics Dashboard</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-primary)', 
                outline: 'none', 
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              <option value="all" style={{ background: '#1e293b', color: 'var(--text-primary)' }}>All Users</option>
              <option value="incharge" style={{ background: '#1e293b', color: 'var(--text-primary)' }}>In-Charge Only</option>
              <option value="incontrol" style={{ background: '#1e293b', color: 'var(--text-primary)' }}>In-Control Only</option>
            </select>
          </div>
          
          <button 
            onClick={fetchAnalytics} 
            className="btn-primary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        <StatCard 
          title="Total Users" 
          value={data.stats.totalUsers} 
          icon={<Users size={24} color="#6366f1" />} 
        />
        <StatCard 
          title="Avg Score (In-Charge)" 
          value={data.stats.avgScore?.toFixed(1) || '0.0'} 
          icon={<TrendingUp size={24} color="#22c55e" />} 
          subtext="Out of 10"
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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {/* User Growth */}
        <div className="glass-card" style={{ padding: '20px', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '20px' }}>User Growth (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.userGrowth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} 
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="glass-card" style={{ padding: '20px', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '20px' }}>Role Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Accuracy Comparison */}
        <div className="glass-card" style={{ padding: '20px', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '20px' }}>Accuracy Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
              <Legend />
              <Bar dataKey="InCharge" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="InControl" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Users */}
        <div className="glass-card" style={{ padding: '20px', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '20px' }}>Top 5 Performers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topUsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis dataKey="name" type="category" width={100} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} />
              <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '20px' }}>User Performance</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Score (Charge/Control)</th>
              <th style={{ padding: '12px' }}>Result</th>
              <th style={{ padding: '12px' }}>Accuracy</th>
              <th style={{ padding: '12px' }}>Last Quiz</th>
            </tr>
          </thead>
          <tbody>
            {data.usersTable.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>{user.score}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    background: user.result === 'In-Charge' ? 'rgba(99, 102, 241, 0.2)' : 
                               user.result === 'In-Control' ? 'rgba(168, 85, 247, 0.2)' : 
                               'rgba(148, 163, 184, 0.2)',
                    color: user.result === 'In-Charge' ? '#818cf8' : 
                           user.result === 'In-Control' ? '#c084fc' : 
                           '#cbd5e1'
                  }}>
                    {user.result || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{user.accuracy}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                  {user.lastQuizDate !== '-' ? new Date(user.lastQuizDate).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination placeholder if needed, current version shows all */}
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, subtext }) => (
  <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{subtext}</div>}
    </div>
  </div>
);

export default AnalyticsDashboard;
