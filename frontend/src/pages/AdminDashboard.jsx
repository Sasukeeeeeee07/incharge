import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuizList from '../components/QuizList';
import QuizEditor from '../components/QuizEditor';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserPerformance from '../components/UserPerformance';
import { Upload, Users, List, BarChart2, LogOut, Download, X, Plus, UserCircle, TrendingUp } from 'lucide-react';

import QuizImportModal from '../components/QuizImportModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizView, setQuizView] = useState('list'); // 'list' or 'editor'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [file, setFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);

  // New State for bulk import
  const [quizImportModalOpen, setQuizImportModalOpen] = useState(false);

  // ... existing hooks ...

  const handleBulkImport = (questions) => {
    // Switch to editor mode
    // Create new blank quiz structure or update existing?
    // Let's create a new blank quiz with these questions pre-filled
    const newQuizTemplate = {
      title: 'Bulk Imported Quiz',
      description: 'Imported via Admin Dashboard',
      questions: questions,
      content: {
        en: {
          title: 'Bulk Imported Quiz',
          description: 'Questions imported from text source.',
          questions: questions
        }
      }
    };

    setSelectedQuiz(newQuizTemplate);
    setQuizView('editor');
    setSuccess('Questions imported successfully. Review and Save.');
    setTimeout(() => setSuccess(''), 6000);
  };

  // ... existing code ...



  const [loading, setLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUsers, setNewUsers] = useState([{ name: '', email: '', mobile: '', company: '' }]);
  const [success, setSuccess] = useState('');
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
      const res = await axios.get(`${API_BASE_URL}/admin/quizzes`);
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
      await axios.put(`${API_BASE_URL}/admin/users/${selectedUser._id}`, selectedUser);
      setUserEditModalOpen(false);
      fetchUsers();
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users`);
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
      const res = await axios.post(`${API_BASE_URL}/admin/import`, formData);
      setImportSummary(res.data);
      setFile(null); // Clear file input
      // Reset file input value manually if needed, or rely on key change
      fetchUsers();
      setSuccess('Valid users imported successfully');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      console.error('Import Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Import failed';
      alert(`Import failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/export`, {
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

  const handleManualCreateUsers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/users`, { users: newUsers });
      setImportSummary(res.data);
      setAddUserModalOpen(false);
      setNewUsers([{ name: '', email: '', mobile: '', company: '' }]);
      fetchUsers();
      setSuccess('Users created successfully');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      console.error('Frontend: Creation Fail:', err);
      alert(err.response?.data?.error || 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  const addMoreUserSection = () => {
    setNewUsers([...newUsers, { name: '', email: '', mobile: '', company: '' }]);
  };

  const updateNewUserField = (index, field, value) => {
    const updated = [...newUsers];
    updated[index][field] = value;
    setNewUsers(updated);
  };

  const removeUserSection = (index) => {
    if (newUsers.length === 1) return;
    setNewUsers(newUsers.filter((_, i) => i !== index));
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
      setUserEditModalOpen(false);
      fetchUsers();
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      console.error('Delete User Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete user';
      alert(`Error deleting user: ${errorMessage}`);
    }
  };



  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPasswordValue.length < 4) return alert("Password must be at least 4 characters");

    try {
      await axios.put(`${API_BASE_URL}/admin/users/${selectedUser._id}/reset-password`, { newPassword: resetPasswordValue });
      setSuccess("Password reset successfully");
      setTimeout(() => setSuccess(''), 6000);
      setResetPasswordModalOpen(false);
      setResetPasswordValue('');
    } catch (err) {
      console.error('Reset Password Error:', err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to reset password";
      alert(`Error resetting password: ${errorMessage}`);
    }
  };

  const renderNavbar = () => (
    <header className="px-4 md:px-10 py-3 md:py-5 flex justify-between items-center border-b border-blue-200/10 bg-blue-900/50 backdrop-blur-md sticky top-0 z-40">
      <div
        className="cursor-pointer flex items-center"
        onClick={() => setActiveTab('analytics')}
      >
        <img
          src="/smmart_Logo.png"
          alt="Smmart Logo"
          className="h-8 md:h-12 w-auto object-contain transition-transform hover:scale-105"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-5 overflow-x-auto no-scrollbar mask-gradient pr-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3 py-2 md:py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <BarChart2 size={18} /> <span className="hidden sm:inline">Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-3 py-2 md:py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'performance' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <TrendingUp size={18} /> <span className="hidden sm:inline">User Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3 py-2 md:py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <Users size={18} /> <span className="hidden sm:inline">Users</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-3 py-2 md:py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'quiz' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <List size={18} /> <span className="hidden sm:inline">Quizzes</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-3 py-2 md:py-3 rounded-lg transition-colors text-text-secondary hover:text-white hover:bg-white/5 whitespace-nowrap">
          <UserCircle size={18} /> <span className="hidden sm:inline">Profile</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 md:py-3 rounded-lg transition-colors text-text-secondary hover:text-white hover:bg-red-900 whitespace-nowrap">
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-sans">
      {renderNavbar()}

      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full relative">
        {success && (
          <div className="fixed top-24 right-5 md:right-10 z-50 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="bg-green-500/10 border border-green-500/20 text-success px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="font-semibold">{success}</span>
              <button onClick={() => setSuccess('')} className="ml-4 hover:text-white transition-colors"><X size={16} /></button>
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-3xl font-bold">User Management</h1>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setAddUserModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                >
                  <Plus size={18} /> Add User
                </button>
                <button onClick={() => setImportModalOpen(true)} className="btn-secondary flex-1 sm:flex-none justify-center">
                  <Upload size={18} /> Import
                </button>
                <button onClick={handleExport} className="btn-secondary flex-1 sm:flex-none justify-center">
                  <Download size={18} /> Export
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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.accessFlag ? 'bg-green-500/10 text-success' : 'bg-red-500/10 text-error'
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
                          <span className={`px-3 py-1 rounded-full text-xs ${u.accessFlag ? 'bg-green-500/10 text-success' : 'bg-red-500/10 text-error'
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

        {/* Add User Modal */}
        {addUserModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-5">
            <div className="glass-card w-full max-w-4xl p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="absolute top-5 right-5 text-text-secondary hover:text-white z-10"
              >
                <X size={24} />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold">Add New Users</h2>
                <p className="text-text-secondary text-sm mt-1">Manually enter user details below</p>
              </div>

              <form id="addUserForm" onSubmit={handleManualCreateUsers} className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar mb-6">
                {newUsers.map((user, index) => (
                  <div key={index} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 group animate-in fade-in slide-in-from-top-4 duration-300">
                    {newUsers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUserSection(index)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase font-bold text-text-secondary px-1">Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={user.name}
                          onChange={(e) => updateNewUserField(index, 'name', e.target.value)}
                          className="quiz-input text-sm py-2.5"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase font-bold text-text-secondary px-1">Email</label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={user.email}
                          onChange={(e) => updateNewUserField(index, 'email', e.target.value)}
                          className="quiz-input text-sm py-2.5"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase font-bold text-text-secondary px-1">Mobile</label>
                        <input
                          type="text"
                          placeholder="+1 234..."
                          value={user.mobile}
                          onChange={(e) => updateNewUserField(index, 'mobile', e.target.value)}
                          className="quiz-input text-sm py-2.5"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase font-bold text-text-secondary px-1">Company</label>
                        <input
                          type="text"
                          placeholder="Organization"
                          value={user.company}
                          onChange={(e) => updateNewUserField(index, 'company', e.target.value)}
                          className="quiz-input text-sm py-2.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMoreUserSection}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-text-secondary hover:text-white hover:border-white/20 hover:bg-white/5 transition-all font-bold flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add another user section
                </button>
              </form>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10 bg-inherit mt-auto">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="btn-secondary flex-1 justify-center py-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMoreUserSection}
                  className="flex-1 justify-center py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 active:scale-[0.98]"
                >
                  Add more users
                </button>
                <button
                  type="submit"
                  form="addUserForm"
                  className="btn-primary flex-1 justify-center py-3"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save All Users'}
                </button>
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
                  className="bg-transparent p-0 border-none w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20"
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
                      onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      className="quiz-input"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium px-1">Email Address</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
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
                      onChange={(e) => setSelectedUser({ ...selectedUser, mobile: e.target.value })}
                      className="quiz-input"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium px-1">Company</label>
                    <input
                      type="text"
                      value={selectedUser.company || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, company: e.target.value })}
                      className="quiz-input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-glass-border">
                  <input
                    type="checkbox"
                    id="accessFlag"
                    checked={selectedUser.accessFlag}
                    onChange={(e) => setSelectedUser({ ...selectedUser, accessFlag: e.target.checked })}
                    className="w-5 h-5 rounded accent-accent-primary"
                  />
                  <label htmlFor="accessFlag" className="font-medium cursor-pointer">Active Access (Enable/Disable User)</label>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setResetPasswordModalOpen(true)}
                    className="flex-1 justify-center py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 active:scale-[0.98]"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="flex-1 justify-center py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98]"
                  >
                    Delete User
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-5">
            <div className="glass-card w-full max-w-md p-8 relative">
              <button
                onClick={() => { setResetPasswordModalOpen(false); setResetPasswordValue(''); }}
                className="absolute top-5 right-5 text-text-secondary hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
              <p className="text-text-secondary mb-4">Set a new password for <strong>{selectedUser?.name}</strong></p>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <input
                  type="text"
                  placeholder="Enter new password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="quiz-input"
                  required
                />
                <button type="submit" className="btn-primary w-full justify-center">
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Quiz Management</h1>
              {quizView === 'list' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizImportModalOpen(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Upload size={18} /> Import Questions
                  </button>
                  <button
                    onClick={handleCreateQuiz}
                    className="btn-primary"
                  >
                    <Plus size={18} /> Create Quiz
                  </button>
                </div>
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
                  setTimeout(() => setSuccess(''), 6000);
                }}
                onCancel={() => setQuizView('list')}
              />
            )}
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'performance' && <UserPerformance />}

        <QuizImportModal
          isOpen={quizImportModalOpen}
          onClose={() => setQuizImportModalOpen(false)}
          onImport={handleBulkImport}
        />
      </main>
    </div>
  );
};



export default AdminDashboard;
