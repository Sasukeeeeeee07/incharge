import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Users, List, BarChart2, LogOut, Download, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuizList from '../components/QuizList';
import QuizEditor from '../components/QuizEditor';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizView, setQuizView] = useState('list'); // 'list' or 'editor'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [file, setFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'quiz') fetchQuizzes();
  }, [activeTab]);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to fetch quizzes');
    }
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setQuizView('editor');
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizView('editor');
  };

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

  const handleExport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Menu onClick={toggleSidebar} style={{ cursor: 'pointer', color: 'var(--text-primary)' }} />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', margin: 0 }}>Admin Panel</h2>
         </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="mobile-only"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>In-Charge OR In-Control</h2>
          <X className="mobile-only" onClick={() => setIsSidebarOpen(false)} style={{ cursor: 'pointer' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <SidebarItem 
            icon={<BarChart2 size={20} />} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} 
          />
          
          <SidebarItem 
            icon={<Users size={20} />} 
            label="User Management" 
            active={activeTab === 'users'} 
            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} 
          />
          {/* Bulk Import Removed */}
          <SidebarItem 
            icon={<List size={20} />} 
            label="Quiz Management" 
            active={activeTab === 'quiz'} 
            onClick={() => { setActiveTab('quiz'); setIsSidebarOpen(false); }} 
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
      <div className="dashboard-content">
        {activeTab === 'users' && (
          <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <h1>Users</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setImportModalOpen(true)} className="btn-secondary">
                <Upload size={18} /> Import Users
              </button>
              <button onClick={handleExport} className="btn-secondary">
                <Download size={18} /> Export Users
              </button>
            </div>
          </div>
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

        {/* Import Modal */}
        {importModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '30px', position: 'relative' }}>
              <button 
                onClick={() => setImportModalOpen(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{ marginBottom: '20px' }}>Bulk User Import</h2>
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
                    <p><span style={{ color: 'var(--success)' }}>Success:</span> {importSummary.success}</p>
                    <p><span style={{ color: 'var(--accent-primary)' }}>Updated:</span> {importSummary.updated}</p>
                    <p><span style={{ color: 'var(--text-secondary)' }}>Duplicates:</span> {importSummary.duplicates}</p>
                    <p><span style={{ color: 'var(--error)' }}>Failure:</span> {importSummary.failure}</p>
                  </div>
                  {importSummary.details.length > 0 && (
                    <div style={{ marginTop: '20px', maxHeight: '150px', overflowY: 'auto' }}>
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
           <div style={{ maxWidth: '1000px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
               <h1>Quiz Management</h1>
               {quizView === 'list' && (
                 <button 
                   onClick={handleCreateQuiz}
                   className="btn-primary" 
                   style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                 >
                   <Plus size={18} /> Create Quiz
                 </button>
               )}
             </div>

             {quizView === 'list' ? (
               <QuizList 
                 quizzes={quizzes} 
                 onEdit={handleEditQuiz} 
                 onRefresh={fetchQuizzes}
                 onView={(quiz) => {
                   setSelectedQuiz(quiz);
                   setQuizView('view');
                 }}
               />
             ) : quizView === 'editor' ? (
               <QuizEditor 
                 quiz={selectedQuiz} 
                 onSave={() => {
                   setQuizView('list');
                   fetchQuizzes();
                 }} 
                 onCancel={() => setQuizView('list')} 
               />
             ) : (
                <div style={{ position: 'relative' }}>
                    <QuizEditor 
                        quiz={selectedQuiz} 
                        onSave={() => setQuizView('list')} // Should not be called in readOnly but safe to have
                        onCancel={() => setQuizView('list')} 
                        readOnly={true}
                    />
                </div>
             )}
           </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}
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
