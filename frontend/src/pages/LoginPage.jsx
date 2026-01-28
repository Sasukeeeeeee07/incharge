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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, #667eea 0%, transparent 70%)',
        opacity: 0.15,
        filter: 'blur(60px)',
        borderRadius: '50%',
        animation: 'float1 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '45%',
        height: '45%',
        background: 'radial-gradient(circle, #764ba2 0%, transparent 70%)',
        opacity: 0.15,
        filter: 'blur(60px)',
        borderRadius: '50%',
        animation: 'float2 20s ease-in-out infinite reverse'
      }} />

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: 'clamp(1.75rem, 5vw, 2.5rem) clamp(1.5rem, 5vw, 2rem)',
        width: '100%', 
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 25px 45px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '0.5rem'
          }}>
            <h1 style={{ 
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: '900', 
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              margin: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #a8b4cc 30%, #94a3b8 70%, #667eea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
            }}>
              In-Charge
            </h1>
            <div style={{
              position: 'absolute',
              bottom: '-0.25rem',
              left: '0',
              right: '0',
              height: '3px',
              background: 'linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%)',
              borderRadius: '2px',
              opacity: 0.8
            }} />
          </div>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
            fontWeight: '800',
            margin: '0.75rem 0 0.5rem 0',
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '-0.03em'
          }}>
            OR
          </h2>
          <h1 style={{ 
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: '900', 
            letterSpacing: '-0.02em',
            lineHeight: '1.1',
            margin: '0.25rem 0 0 0',
            background: 'linear-gradient(135deg, #94a3b8 0%, #667eea 40%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}>
            In-Control
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            marginTop: '1rem', 
            fontSize: 'clamp(0.95rem, 2.5vw, 1rem)',
            lineHeight: '1.5'
          }}>
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontWeight: '500',
              marginLeft: '0.25rem'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }} 
              />
              <input 
                type="email" 
                placeholder="Ex. example@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontWeight: '500',
              marginLeft: '0.25rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }} 
              />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              padding: '0.875rem', 
              borderRadius: '12px', 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5', 
              fontSize: '0.875rem',
              textAlign: 'center',
              animation: 'shake 0.3s ease-in-out'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            style={{ 
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Sign In
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 15px) scale(1.03); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @media (max-width: 480px) {
          div[style*="minHeight: '100vh'"] {
            padding: 15px !important;
          }
          div[style*="padding: 'clamp"] {
            padding: 2rem 1.5rem !important;
            margin: 1rem !important;
          }
        }
        @media (max-width: 360px) {
          div[style*="padding: 'clamp"] {
            padding: 1.75rem 1.25rem !important;
          }
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
