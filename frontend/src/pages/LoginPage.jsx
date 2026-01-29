import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.firstLoginRequired) {
        navigate('/update-password');
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/quiz');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] font-sans">
      {/* Animated Background Blobs */}
      <div className="absolute -top-1/4 -left-1/4 w-2/5 h-2/5 bg-gradient-radial from-[#667eea] to-transparent rounded-full opacity-15 blur-3xl animate-float1" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-[#764ba2] to-transparent rounded-full opacity-15 blur-3xl animate-float2" />

      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10 mx-4 sm:mx-0 shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              In-Charge
            </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-80" />
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white/90 -tracking-tight mb-2">
            OR
          </h2>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
            In-Control
          </h1>
          
          <p className="text-white/60 mt-6 text-lg leading-relaxed">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-white/70 ml-1 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 z-10" />
              <input 
                type="email" 
                placeholder="Ex. example@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-white placeholder-white/40 text-lg focus:border-blue-400/50 focus:bg-white/15 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 hover:border-white/25"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-white/70 ml-1 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 z-10" />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-white placeholder-white/40 text-lg focus:border-blue-400/50 focus:bg-white/15 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 hover:border-white/25"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-100 text-sm text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 active:translate-y-0 active:shadow-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
