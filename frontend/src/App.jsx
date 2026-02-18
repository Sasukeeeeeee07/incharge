import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ProfilePage from './pages/ProfilePage';

import AdminDashboard from './pages/AdminDashboard';
import QuizPage from './pages/QuizPage';

const ProtectedRoute = ({ children, requireAdmin, updatePasswordPage }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // If user needs to update password and is NOT on the update page, redirect them there
  if (user?.firstLoginRequired && !updatePasswordPage) {
    return <Navigate to="/update-password" />;
  }

  // If user DOES NOT need to update password but IS on the update page, redirect them back
  if (!user?.firstLoginRequired && updatePasswordPage) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/quiz'} />;
  }

  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/quiz" />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/update-password" element={<ProtectedRoute updatePasswordPage><UpdatePasswordPage /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
