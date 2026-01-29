import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Camera, Save, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user: authUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const isAdmin = authUser?.role === 'admin';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setSaving(true);
      const res = await axios.post('http://localhost:5000/api/user/profile/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(prev => ({ ...prev, profileImage: res.data.imageUrl }));
      setSuccess('Image uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await axios.put('http://localhost:5000/api/user/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setResettingPassword(true);
      setPasswordError('');
      await axios.put('http://localhost:5000/api/user/reset-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordSuccess('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-10 px-5 md:py-20">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="glass-card p-8 md:p-12 relative overflow-hidden mb-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-glass-border overflow-hidden bg-bg-secondary flex items-center justify-center">
                {profile?.profileImage ? (
                  <img 
                    src={`http://localhost:5000${profile.profileImage}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={64} className="text-text-secondary" />
                )}
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-3 bg-accent-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={20} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile?.name}</h1>
              <span className="px-4 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-semibold uppercase tracking-wider">
                {profile?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" 
                name="name"
                value={profile?.name || ''} 
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={profile?.email || ''} 
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input 
                type="text" 
                name="mobile"
                value={profile?.mobile || ''} 
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium flex items-center gap-2">
                <User size={16} /> Company
              </label>
              <input 
                type="text" 
                name="company"
                value={profile?.company || ''} 
                onChange={handleInputChange}
                disabled={true} 
                className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70 shadow-sm"
              />
            </div>
          </div>

          {error && <p className="mt-8 text-error bg-error/10 p-4 rounded-xl text-center font-medium">{error}</p>}
          {success && <p className="mt-8 text-success bg-success/10 p-4 rounded-xl text-center font-medium">{success}</p>}

          <div className="mt-12 flex flex-wrap justify-end gap-4">
            {!showPasswordReset && (
              <button 
                onClick={() => setShowPasswordReset(true)}
                className="px-8 py-3 rounded-xl border border-glass-border hover:bg-white/5 transition-colors font-semibold flex items-center gap-2"
              >
                <Lock size={18} /> Reset Password
              </button>
            )}
            {isAdmin && (
              isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-3 rounded-xl border border-glass-border hover:bg-white/5 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )
            )}
          </div>
        </div>

        {/* Password Reset Modal Overlay */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-5">
            <div className="glass-card w-full max-w-xl p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 m-0">
                  <Lock size={24} className="text-accent-primary" /> Reset Password
                </h2>
                <button 
                  onClick={() => setShowPasswordReset(false)}
                  className="text-text-secondary hover:text-white transition-colors"
                  type="button"
                >
                  Close
                </button>
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary font-medium">Current Password</label>
                    <input 
                      type="password" 
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary font-medium">New Password</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary font-medium">Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-bg-secondary/50 border border-glass-border rounded-xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-colors"
                      required
                    />
                  </div>
                </div>
                
                {passwordError && <p className="text-error bg-error/10 p-4 rounded-xl text-center font-medium">{passwordError}</p>}
                {passwordSuccess && <p className="text-success bg-success/10 p-4 rounded-xl text-center font-medium">{passwordSuccess}</p>}

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={resettingPassword}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {resettingPassword ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  </div>
);
};

export default ProfilePage;
