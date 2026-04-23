import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function StudyPlanner() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ examName: user?.targetExam || 'UPSC', examDate: '', hoursPerDay: 6 });
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    api.get('/study-plans/active')
      .then(res => setPlan(res.data.studyPlan))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.examDate) { toast.error('Please set your exam date'); return; }
    setGenerating(true);
    try {
      const res = await api.post('/study-plans/generate', form);
      setPlan(res.data.studyPlan);
      toast.success('Study plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally { setGenerating(false); }
  };

  const markComplete = async (dayNumber) => {
    if (!plan) return;
    try {
      const res = await api.post('/study-plans/mark-complete', { planId: plan._id, dayNumber });
      setPlan(res.data.studyPlan);
      toast.success('Day marked complete! 🎉');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <PageLoader />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPlan = plan?.plan?.find(d => {
    const pd = new Date(d.date);
    pd.setHours(0, 0, 0, 0);
    return pd.getTime() === today.getTime();
  });

  const upcomingDays = plan?.plan?.filter(d => {
    const pd = new Date(d.date);
    pd.setHours(0, 0, 0, 0);
    return pd >= today;
  }).slice(0, 14) || [];

  const completedDays = plan?.plan?.filter(d => d.isCompleted) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Study Planner</h1>
        <p className="text-gray-500 text-sm mt-0.5">AI-generated day-wise plan to cover full syllabus</p>
      </div>

      {/* Generate form */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">{plan ? '🔄 Regenerate Plan' : '✨ Generate Your Study Plan'}</h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
            <input value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="UPSC, APPSC..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
            <input type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Day</label>
            <div className="flex gap-2">
              <input type="number" value={form.hoursPerDay} onChange={e => setForm({ ...form, hoursPerDay: parseInt(e.target.value) })}
                min={1} max={16}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" disabled={generating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors whitespace-nowrap">
                {generating ? '...' : plan ? 'Regenerate' : 'Generate'}
              </button>
            </div>
          </div>
        </form>
        {generating && (
          <div className="mt-4 flex items-center gap-3 text-blue-600 text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            AI is creating your personalized study plan...
          </div>
        )}
      </div>

      {plan && (
        <>
          {/* Progress bar */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{plan.examName} — Study Progress</h3>
              <span className="text-2xl font-bold text-blue-700">{plan.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${plan.completionPercentage}%` }}></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{completedDays.length} / {plan.plan.length} days completed</span>
              <span>Exam: {new Date(plan.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[['today', "Today's Task"], ['upcoming', 'Upcoming (14 days)'], ['all', 'Full Plan']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'today' && (
            <div>
              {todayPlan ? (
                <div className={`bg-white rounded-xl p-6 shadow-sm border-2 ${todayPlan.isCompleted ? 'border-green-300' : 'border-blue-300'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-600 mb-1">TODAY — DAY {todayPlan.dayNumber}</p>
                      <h3 className="text-xl font-bold text-gray-800">{todayPlan.topic}</h3>
                      <p className="text-blue-600 font-medium mt-1">{todayPlan.subject}</p>
                      {todayPlan.notes && <p className="text-gray-500 text-sm mt-2 italic">{todayPlan.notes}</p>}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">⏱ {todayPlan.estimatedHours}h suggested</span>
                      </div>
                    </div>
                    {!todayPlan.isCompleted ? (
                      <button onClick={() => markComplete(todayPlan.dayNumber)}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                        Mark Done ✓
                      </button>
                    ) : (
                      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">✅ Completed!</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                  <p className="text-gray-500">No task scheduled for today</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'upcoming' || activeTab === 'all') && (
            <div className="space-y-2">
              {(activeTab === 'upcoming' ? upcomingDays : plan.plan).map(day => (
                <div key={day.dayNumber} className={`bg-white rounded-xl p-4 shadow-sm border transition-colors ${day.isCompleted ? 'border-green-200 opacity-70' : 'border-gray-100 hover:border-blue-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${day.isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {day.isCompleted ? '✓' : day.dayNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{day.topic}</p>
                        <p className="text-xs text-gray-400">{day.subject} • Day {day.dayNumber} • {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{day.estimatedHours}h</span>
                      {!day.isCompleted && (
                        <button onClick={() => markComplete(day.dayNumber)}
                          className="text-xs text-green-600 border border-green-300 px-2.5 py-1 rounded-lg hover:bg-green-50 transition-colors">
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!plan && !loading && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-600 font-medium">No study plan yet</p>
          <p className="text-gray-400 text-sm mt-1">Fill in your exam date above and generate a plan</p>
        </div>
      )}
    </div>
  );
}
