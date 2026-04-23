import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import AnswerWriting from './pages/AnswerWriting';
import MyAnswers from './pages/MyAnswers';
import UploadCenter from './pages/UploadCenter';
import Analytics from './pages/Analytics';
import StudyPlanner from './pages/StudyPlanner';
import ExamProfiles from './pages/ExamProfiles';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="answer/:questionId" element={<AnswerWriting />} />
        <Route path="my-answers" element={<MyAnswers />} />
        <Route path="upload" element={<UploadCenter />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="study-plan" element={<StudyPlanner />} />
        <Route path="exams" element={<ExamProfiles />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9' } }} />
      </Router>
    </AuthProvider>
  );
}
