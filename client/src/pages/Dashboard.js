import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center text-xl mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/questions/daily').catch(() => ({ data: { question: null } })),
      api.get('/answers/stats').catch(() => ({ data: {} }))
    ]).then(([q, s]) => {
      setDailyQuestion(q.data.question);
      setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader text="Loading your dashboard..." />;

  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">{todayStr}</p>
      </div>

      {/* Streak banner */}
      {user?.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 mb-6 text-white flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">🔥 {user.currentStreak} Day Streak!</p>
            <p className="text-orange-100 text-sm">Keep it going — consistency is the key to success</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{user.currentStreak}</p>
            <p className="text-orange-100 text-xs">days</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="✏️" label="Total Answers" value={stats?.totalAnswers || 0} sub="answers written" color="blue" />
        <StatCard icon="⭐" label="Avg Score" value={`${stats?.averageScore || 0}/10`} sub="across all answers" color="green" />
        <StatCard icon="📅" label="This Week" value={stats?.weeklyAnswers || 0} sub="answers this week" color="purple" />
        <StatCard icon="🎯" label="Target Exam" value={user?.targetExam || 'UPSC'} sub="keep going!" color="orange" />
      </div>

      {/* Daily Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>📌</span> Today's Question
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">AI-selected based on your progress</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">Daily Challenge</span>
        </div>

        {dailyQuestion ? (
          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">{dailyQuestion.subject}</span>
              {dailyQuestion.topic && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{dailyQuestion.topic}</span>}
              {dailyQuestion.year && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{dailyQuestion.year}</span>}
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{dailyQuestion.marks} marks</span>
            </div>
            <p className="text-gray-800 text-base leading-relaxed mb-5">{dailyQuestion.questionText}</p>
            <button
              onClick={() => navigate(`/answer/${dailyQuestion._id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Write Answer →
            </button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-600 font-medium">No questions yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload previous year papers to get daily questions</p>
            <Link to="/upload" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Upload Papers
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/questions', icon: '📚', label: 'Browse Questions', desc: 'Filter by subject & year' },
          { to: '/upload', icon: '📤', label: 'Upload Papers', desc: 'PDFs auto-extracted by AI' },
          { to: '/analytics', icon: '📊', label: 'View Analytics', desc: 'Track your progress' },
          { to: '/study-plan', icon: '📅', label: 'Study Plan', desc: 'Day-wise schedule' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
            <span className="text-2xl block mb-2">{item.icon}</span>
            <p className="font-medium text-gray-800 text-sm group-hover:text-blue-700">{item.label}</p>
            <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
