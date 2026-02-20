import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

const SplashScreen = lazy(() => import('./pages/SplashScreen'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const QuizPage = lazy(() => import('./pages/QuizPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">
    Loading...
  </div>
);

const ProtectedRoute = ({ children, requireAdmin, updatePasswordPage }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;

  if (user?.firstLoginRequired && !updatePasswordPage) {
    return <Navigate to="/update-password" />;
  }

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/update-password" element={<ProtectedRoute updatePasswordPage><UpdatePasswordPage /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
