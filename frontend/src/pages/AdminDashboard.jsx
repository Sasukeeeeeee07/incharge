import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Users, List, BarChart2, LogOut, Download, Menu, X, Plus, UserCircle } from 'lucide-react';
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${selectedUser._id}`, selectedUser);
      setUserEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
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
    <div className="min-h-screen bg-bg-primary flex transition-all duration-300">

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''} h-screen fixed top-0 left-0 bottom-0 w-[250px] md:sticky md:block z-50 transition-transform duration-300 flex-shrink-0 flex flex-col`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl text-orange-500 font-bold mb-10">In-Charge OR In-Control</h2>
          <X className="md:hidden cursor-pointer text-text-primary" onClick={() => setIsSidebarOpen(false)} />
        </div>
        
        <div className="flex flex-col gap-3">

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

        {/* Sidebar Footer (Profile & Logout) */}
        <div className="mt-auto flex flex-col gap-3 pt-40 border-t border-white/[0.05]">
          <SidebarItem 
            icon={<UserCircle size={20} />} 
            label="Profile" 
            onClick={() => navigate('/profile')} 
          />
          <SidebarItem 
            icon={<LogOut size={20} />} 
            label="Logout" 
            onClick={handleLogout} 
            danger
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="px-5 md:px-10 py-5 flex justify-between items-center border-b border-glass-border bg-bg-secondary/50 backdrop-blur-md sticky top-0 z-40 md:hidden">
          <div className="flex items-center gap-3 md:hidden">
            <Menu onClick={toggleSidebar} className="cursor-pointer text-text-primary" />
            <h2 className="text-xl text-accent-primary m-0">Admin</h2>
          </div>
          <div className="hidden md:block">
            {/* Empty space or breadcrumbs can go here */}
          </div>
          <div className="flex items-center gap-5 ml-auto md:hidden">
            <button 
              onClick={() => navigate('/profile')} 
              className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
            >
              <UserCircle size={18} /> <span className="hidden sm:inline">Profile</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="p-5 md:p-10 overflow-y-auto flex-1">
        {activeTab === 'users' && (
          <div>
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">Users</h1>
            <div className="flex gap-3">
              <button onClick={() => setImportModalOpen(true)} className="btn-secondary">
                <Upload size={18} /> Import Users
              </button>
              <button onClick={handleExport} className="btn-secondary">
                <Download size={18} /> Export Users
              </button>
            </div>
          </div>
            <div className="glass-card p-0 overflow-hidden">
              {/* Mobile View: Cards */}
              <div className="md:hidden divide-y divide-white/[0.05]">
                {users.map((u, i) => (
                  <div key={i} className="p-4 space-y-3 active:bg-white/[0.05] cursor-pointer" onClick={() => { setSelectedUser(u); setUserEditModalOpen(true); }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-text-primary">{u.name}</div>
                        <div className="text-xs text-text-secondary">{u.email}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.accessFlag ? 'bg-green-500/10 text-success' : 'bg-red-500/10 text-error'
                      }`}>
                        {u.accessFlag ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                       <div>
                         <div className="text-text-secondary text-[11px] uppercase font-semibold">Mobile</div>
                         <div className="text-text-primary font-medium truncate">{u.mobile}</div>
                       </div>
                       <div>
                         <div className="text-text-secondary text-[11px] uppercase font-semibold">Company</div>
                         <div className="text-text-primary font-medium truncate">{u.company || '-'}</div>
                       </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="p-6 text-center text-text-secondary">No users found</div>
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-text-secondary border-b border-glass-border">
                      <th className="p-4 whitespace-nowrap">Name</th>
                      <th className="p-4 whitespace-nowrap">Email</th>
                      <th className="p-4 whitespace-nowrap">Mobile</th>
                      <th className="p-4 whitespace-nowrap">Company</th>
                      <th className="p-4 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-glass-border hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setSelectedUser(u); setUserEditModalOpen(true); }}>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.mobile}</td>
                        <td className="p-4">{u.company || '-'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            u.accessFlag ? 'bg-green-500/10 text-success' : 'bg-red-500/10 text-error'
                          }`}>
                            {u.accessFlag ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-5">
            <div className="glass-card w-full max-w-xl p-8 relative">
              <button 
                onClick={() => setImportModalOpen(false)} 
                className="absolute top-5 right-5 text-text-secondary hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-5">Bulk User Import</h2>
              <form onSubmit={handleImport} className="flex flex-col gap-5">
                <p className="text-text-secondary">Upload CSV or Excel file containing: Name, Email, Mobile, Company, AccessFlag</p>
                <input 
                  type="file" 
                  accept=".csv, .xlsx" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="bg-transparent p-0 border-none"
                />
                <button type="submit" className="btn-primary justify-center" disabled={loading || !file}>
                  {loading ? 'Importing...' : 'Start Import'}
                </button>
              </form>

              {importSummary && (
                <div className="mt-8 p-5 bg-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3">Import Summary</h3>
                  <div className="flex flex-wrap gap-5">
                    <p><span className="text-success font-bold">Success:</span> {importSummary.success}</p>
                    <p><span className="text-accent-primary font-bold">Updated:</span> {importSummary.updated}</p>
                    <p><span className="text-text-secondary font-bold">Duplicates:</span> {importSummary.duplicates}</p>
                    <p><span className="text-error font-bold">Failure:</span> {importSummary.failure}</p>
                  </div>
                  {importSummary.details.length > 0 && (
                    <div className="mt-5 max-h-40 overflow-y-auto space-y-1">
                      {importSummary.details.map((d, i) => (
                        <p key={i} className="text-sm text-error">
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

        {/* Edit User Modal */}
        {userEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-5">
            <div className="glass-card w-full max-w-xl p-8 relative">
              <button 
                onClick={() => setUserEditModalOpen(false)} 
                className="absolute top-5 right-5 text-text-secondary hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Edit User</h2>
              <form onSubmit={handleUpdateUser} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={selectedUser.name} 
                      onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                      className="quiz-input"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium px-1">Email Address</label>
                    <input 
                      type="email" 
                      value={selectedUser.email} 
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      className="quiz-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium px-1">Mobile Number</label>
                    <input 
                      type="text" 
                      value={selectedUser.mobile} 
                      onChange={(e) => setSelectedUser({...selectedUser, mobile: e.target.value})}
                      className="quiz-input"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium px-1">Company</label>
                    <input 
                      type="text" 
                      value={selectedUser.company || ''} 
                      onChange={(e) => setSelectedUser({...selectedUser, company: e.target.value})}
                      className="quiz-input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-glass-border">
                  <input 
                    type="checkbox" 
                    id="accessFlag"
                    checked={selectedUser.accessFlag} 
                    onChange={(e) => setSelectedUser({...selectedUser, accessFlag: e.target.checked})}
                    className="w-5 h-5 rounded accent-accent-primary"
                  />
                  <label htmlFor="accessFlag" className="font-medium cursor-pointer">Active Access (Enable/Disable User)</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setUserEditModalOpen(false)} className="btn-secondary flex-1 justify-center">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
           <div className="max-w-[1000px]">
             <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-bold">Quiz Management</h1>
               {quizView === 'list' && (
                 <button 
                   onClick={handleCreateQuiz}
                   className="btn-primary" 
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
               />
             ) : (
               <QuizEditor 
                 quiz={selectedQuiz} 
                 onSave={() => {
                   setQuizView('list');
                   fetchQuizzes();
                 }} 
                 onCancel={() => setQuizView('list')} 
               />
             )}
           </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, danger }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200
      ${active ? 'bg-accent-primary/10 text-accent-primary' : 'hover:bg-white/5 text-text-secondary'}
      ${danger ? 'text-error hover:text-red-400 hover:bg-red-500/10' : ''}
    `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default AdminDashboard;
