import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Users, List, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/admin/import', formData);
      setImportSummary(res.data);
      fetchUsers();
    } catch (err) {
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRight: '1px solid var(--glass-border)' }}>
        <h2 style={{ marginBottom: '40px', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>In-Charge OR In-Control</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SidebarItem 
            icon={<Users size={20} />} 
            label="User Management" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
          <SidebarItem 
            icon={<Upload size={20} />} 
            label="Bulk Import" 
            active={activeTab === 'import'} 
            onClick={() => setActiveTab('import')} 
          />
          <SidebarItem 
            icon={<List size={20} />} 
            label="Quiz Management" 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
          />
          <SidebarItem 
            icon={<BarChart2 size={20} />} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <SidebarItem 
            icon={<LogOut size={20} />} 
            label="Logout" 
            onClick={handleLogout} 
            danger
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', overflowY: 'auto' }}>
        {activeTab === 'users' && (
          <div>
            <h1 style={{ marginBottom: '30px' }}>Users</h1>
            <div className="glass-card" style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '15px' }}>Name</th>
                    <th style={{ padding: '15px' }}>Email</th>
                    <th style={{ padding: '15px' }}>Mobile</th>
                    <th style={{ padding: '15px' }}>Company</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '15px' }}>{u.name}</td>
                      <td style={{ padding: '15px' }}>{u.email}</td>
                      <td style={{ padding: '15px' }}>{u.mobile}</td>
                      <td style={{ padding: '15px' }}>{u.company || '-'}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          background: u.accessFlag ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.accessFlag ? 'var(--success)' : 'var(--error)'
                        }}>
                          {u.accessFlag ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '30px' }}>Bulk User Import</h1>
            <div className="glass-card" style={{ padding: '40px' }}>
              <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Upload CSV or Excel file containing: Name, Email, Mobile, Company, AccessFlag</p>
                <input 
                  type="file" 
                  accept=".csv, .xlsx" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  style={{ background: 'transparent', padding: '0' }}
                />
                <button type="submit" className="btn-primary" disabled={loading || !file}>
                  {loading ? 'Importing...' : 'Start Import'}
                </button>
              </form>

              {importSummary && (
                <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <h3>Import Summary</h3>
                  <div style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
                    <p><span style={{ color: 'var(--success)' }}>Success:</span> {importSummary.success}</p>
                    <p><span style={{ color: 'var(--error)' }}>Failure:</span> {importSummary.failure}</p>
                    <p><span style={{ color: 'var(--accent-primary)' }}>Duplicates:</span> {importSummary.duplicates}</p>
                  </div>
                  {importSummary.details.length > 0 && (
                    <div style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                      {importSummary.details.map((d, i) => (
                        <p key={i} style={{ fontSize: '0.9rem', color: 'var(--error)', marginBottom: '5px' }}>
                          {d.email}: {d.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
           <div style={{ padding: '40px', textAlign: 'center' }}>
             <h2>Quiz Management</h2>
             <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>Activation and CRUD controls coming soon.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, danger }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      color: danger ? 'var(--error)' : (active ? 'var(--accent-primary)' : 'var(--text-secondary)')
    }}
  >
    {icon}
    <span style={{ fontWeight: 500 }}>{label}</span>
  </div>
);

export default AdminDashboard;
