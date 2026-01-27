import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';

import AdminDashboard from './pages/AdminDashboard';
import QuizPage from './pages/QuizPage';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (user?.firstLoginRequired && window.location.pathname !== '/update-password') {
    return <Navigate to="/update-password" />;
  }
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/quiz" />;
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/update-password" element={<ProtectedRoute><UpdatePasswordPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
