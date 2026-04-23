import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SUBJECTS = ['All', 'History', 'Geography', 'Polity', 'Economy', 'Science & Technology', 'Environment', 'Current Affairs', 'General Studies'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', difficulty: '', year: '', examName: '', page: 1 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.subject && filters.subject !== 'All') params.subject = filters.subject;
      if (filters.difficulty && filters.difficulty !== 'All') params.difficulty = filters.difficulty;
      if (filters.year) params.year = filters.year;
      if (filters.examName) params.examName = filters.examName;
      params.page = filters.page;
      params.limit = 15;
      const res = await api.get('/questions', { params });
      setQuestions(res.data.questions);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const difficultyColor = { Easy: 'text-green-600 bg-green-50', Medium: 'text-yellow-600 bg-yellow-50', Hard: 'text-red-600 bg-red-50' };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} questions from your uploaded papers</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value, page: 1 })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
          {SUBJECTS.map(s => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
        </select>
        <select value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
          {DIFFICULTIES.map(d => <option key={d} value={d === 'All' ? '' : d}>{d}</option>)}
        </select>
        <input type="number" placeholder="Year (e.g. 2023)" value={filters.year}
          onChange={e => setFilters({ ...filters, year: e.target.value, page: 1 })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="text" placeholder="Exam name..." value={filters.examName}
          onChange={e => setFilters({ ...filters, examName: e.target.value, page: 1 })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {loading ? <PageLoader /> : questions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-600 font-medium">No questions found</p>
          <p className="text-gray-400 text-sm mt-1">Upload previous year papers or adjust your filters</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{q.subject}</span>
                      {q.topic && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{q.topic}</span>}
                      {q.year && <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{q.year}</span>}
                      {q.examName && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">{q.examName}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[q.difficulty] || difficultyColor.Medium}`}>{q.difficulty}</span>
                      <span className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">{q.marks}M</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-2">{q.questionText}</p>
                    {q.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.keywords.slice(0, 4).map(kw => (
                          <span key={kw} className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">#{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => navigate(`/answer/${q._id}`)}
                    className="flex-shrink-0 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Answer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                ← Prev
              </button>
              <span className="text-sm text-gray-500">Page {filters.page} of {pages}</span>
              <button disabled={filters.page === pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {showAddModal && <AddQuestionModal onClose={() => setShowAddModal(false)} onAdded={() => { setShowAddModal(false); fetchQuestions(); }} />}
    </div>
  );
}

function AddQuestionModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ questionText: '', subject: 'History', topic: '', examName: 'UPSC', year: '', questionType: 'Essay', marks: 10, difficulty: 'Medium' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/questions', form);
      toast.success('Question added!');
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-lg">Add Question Manually</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={4} placeholder="Question text..." required />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Subject" required />
            <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Topic" />
            <input value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Exam name" />
            <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Year" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? 'Adding...' : 'Add Question'}
          </button>
        </form>
      </div>
    </div>
  );
}
