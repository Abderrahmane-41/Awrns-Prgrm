import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuizList from './pages/QuizList.jsx';
import ModuleDispatcher from './pages/ModuleDispatcher.jsx';
import Scores from './pages/Scores.jsx';
import NewsFeed from './pages/NewsFeed.jsx';
import LearningPath from './pages/LearningPath.jsx';
import GlobalStats from './pages/GlobalStats.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import UpdatePassword from './pages/UpdatePassword.jsx';
import Quiz from './pages/Quiz.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import Layout from './components/Layout.jsx';

// Protects routes that require login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"       element={<Navigate to="/login" replace />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <PrivateRoute>
                <QuizList />
              </PrivateRoute>
            }
          />
          <Route
            path="/quizzes/:moduleId"
            element={
              <PrivateRoute>
                <ModuleDispatcher />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:moduleId"
            element={
              <PrivateRoute>
                <Quiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/scores"
            element={
              <PrivateRoute>
                <Scores />
              </PrivateRoute>
            }
          />
          <Route
            path="/news"
            element={
              <PrivateRoute>
                <NewsFeed />
              </PrivateRoute>
            }
          />
          <Route
            path="/learning-path"
            element={
              <PrivateRoute>
                <LearningPath />
              </PrivateRoute>
            }
          />
          <Route
            path="/global-stats"
            element={
              <PrivateRoute>
                <GlobalStats />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;