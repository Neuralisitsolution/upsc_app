import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

export default function Analytics() {
  const [qStats, setQStats] = useState(null);
  const [aStats, setAStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/questions/stats').catch(() => ({ data: {} })),
      api.get('/answers/stats').catch(() => ({ data: {} }))
    ]).then(([q, a]) => {
      setQStats(q.data);
      setAStats(a.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const subjectData = (qStats?.subjectStats || []).map(s => ({ name: s._id, count: s.count }));
  const yearData = (qStats?.yearStats || []).map(y => ({ year: String(y._id), count: y.count })).reverse();
  const topicData = (qStats?.topicStats || []).slice(0, 10).map(t => ({ name: `${t._id.topic || t._id.subject}`, count: t.count }));
  const scoreBySubject = (aStats?.scoreBySubject || []).map(s => ({ name: s._id, score: parseFloat(s.avgScore?.toFixed(1) || 0), count: s.count }));
  const recentScores = aStats?.recentScores || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Patterns, performance and insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Questions" value={subjectData.reduce((a, b) => a + b.count, 0)} icon="📚" />
        <StatBox label="Answers Written" value={aStats?.totalAnswers || 0} icon="✏️" />
        <StatBox label="Average Score" value={`${aStats?.averageScore || 0}/10`} icon="⭐" />
        <StatBox label="This Month" value={aStats?.monthlyAnswers || 0} icon="📅" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject distribution */}
        {subjectData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Questions by Subject</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={subjectData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Year-wise questions */}
        {yearData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Questions by Year</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Questions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score trend */}
        {recentScores.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Score Trend (Recent)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={recentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`${v}/10`, 'Score']} labelFormatter={d => new Date(d).toLocaleDateString()} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score by subject */}
        {scoreBySubject.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Score by Subject</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreBySubject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={v => [`${v}/10`, 'Avg Score']} />
                <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top topics */}
      {topicData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Most Frequent Topics (from Previous Years)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Frequency" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak subjects */}
      {scoreBySubject.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-3">📉 Weak Areas (Focus Here)</h3>
            {scoreBySubject.filter(s => s.score < 6).sort((a, b) => a.score - b.score).slice(0, 5).map(s => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
                <span className="text-sm text-red-700 font-medium">{s.name}</span>
                <span className="text-sm text-red-600 font-bold">{s.score}/10</span>
              </div>
            ))}
            {scoreBySubject.filter(s => s.score < 6).length === 0 && <p className="text-red-600 text-sm">No weak areas found yet — keep answering!</p>}
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-green-800 mb-3">📈 Strong Areas</h3>
            {scoreBySubject.filter(s => s.score >= 7).sort((a, b) => b.score - a.score).slice(0, 5).map(s => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                <span className="text-sm text-green-700 font-medium">{s.name}</span>
                <span className="text-sm text-green-600 font-bold">{s.score}/10</span>
              </div>
            ))}
            {scoreBySubject.filter(s => s.score >= 7).length === 0 && <p className="text-green-600 text-sm">Keep practicing to build strong areas!</p>}
          </div>
        </div>
      )}

      {subjectData.length === 0 && aStats?.totalAnswers === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-600 font-medium">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">Upload question papers and write answers to see analytics</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
