import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';
import { Lock, ShieldCheck } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !user.firstLoginRequired) {
      navigate(user.role === 'admin' ? '/admin' : '/quiz');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/update-password`, { newPassword }, {
        withCredentials: true
      });
      const updatedUser = { ...user, firstLoginRequired: false };
      setUser(updatedUser);
      navigate(user.role === 'admin' ? '/admin' : '/quiz');
    } catch (err) {
      console.error('Debug: Password update failed', err);
      setError(err.response?.data?.error || err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-5 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 rounded-full blur-[120px] animate-float1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/20 rounded-full blur-[120px] animate-float2" />

      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-2">{t('Security update', 'Security Update')}</h2>
        <p className="text-text-secondary text-center mb-8">
          {user?.firstLoginRequired
            ? t('Create new password', "Create New Password")
            : t('Update password ', "Update your account password below.")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary ml-1">{t('New password', 'New Password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                type="password"
                placeholder={t(' Enter new password', 'Enter new password')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="input-base pl-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary ml-1">{t('Confirm password', 'Confirm Password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                type="password"
                placeholder={t('Re-enter new password', 'Re-enter new password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-base pl-12"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-error rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? t('updating', 'Updating...') : t('Update password', 'Update Password')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
