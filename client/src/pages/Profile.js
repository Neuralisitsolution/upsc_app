import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EXAMS = ['UPSC', 'APPSC', 'TSPSC', 'BPSC', 'MPPSC', 'UPPSC', 'RPSC', 'TNPSC', 'KPSC', 'Other'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    targetExam: user?.targetExam || 'UPSC',
    examDate: user?.examDate ? new Date(user.examDate).toISOString().split('T')[0] : '',
    studyHoursPerDay: user?.studyHoursPerDay || 6,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const daysToExam = form.examDate
    ? Math.max(0, Math.ceil((new Date(form.examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account and exam preferences</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
          <p className="text-2xl font-bold text-orange-600">🔥 {user?.currentStreak || 0}</p>
          <p className="text-xs text-orange-500 mt-1">Current Streak</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{user?.totalAnswersWritten || 0}</p>
          <p className="text-xs text-blue-500 mt-1">Answers Written</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
          <p className="text-2xl font-bold text-purple-600">{user?.longestStreak || 0}</p>
          <p className="text-xs text-purple-500 mt-1">Best Streak</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
            <select value={form.targetExam} onChange={e => setForm({ ...form, targetExam: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
            <input type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {daysToExam !== null && (
              <p className="text-xs text-blue-600 mt-1 font-medium">{daysToExam} days until your exam!</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Study Hours Per Day</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={16} value={form.studyHoursPerDay}
                onChange={e => setForm({ ...form, studyHoursPerDay: parseInt(e.target.value) })}
                className="flex-1 accent-blue-600" />
              <span className="text-sm font-semibold text-blue-700 w-16 text-right">{form.studyHoursPerDay} hrs</span>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* App info */}
      <div className="bg-gray-50 rounded-xl p-4 mt-5 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">About ExamAI</h3>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Powered by Google Gemini 1.5 Pro AI</li>
          <li>• Supports UPSC, APPSC, TSPSC and all state PSC exams</li>
          <li>• Upload PDFs — AI extracts questions automatically</li>
          <li>• Get detailed AI evaluation on every answer you write</li>
          <li>• Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</li>
        </ul>
      </div>
    </div>
  );
}
