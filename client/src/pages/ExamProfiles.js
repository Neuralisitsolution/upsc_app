import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const PRESET_EXAMS = [
  { name: 'UPSC', fullName: 'Union Public Service Commission', state: 'National' },
  { name: 'APPSC', fullName: 'Andhra Pradesh Public Service Commission', state: 'Andhra Pradesh' },
  { name: 'TSPSC', fullName: 'Telangana State Public Service Commission', state: 'Telangana' },
  { name: 'BPSC', fullName: 'Bihar Public Service Commission', state: 'Bihar' },
  { name: 'MPPSC', fullName: 'Madhya Pradesh Public Service Commission', state: 'Madhya Pradesh' },
  { name: 'UPPSC', fullName: 'Uttar Pradesh Public Service Commission', state: 'Uttar Pradesh' },
  { name: 'TNPSC', fullName: 'Tamil Nadu Public Service Commission', state: 'Tamil Nadu' },
];

export default function ExamProfiles() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState(null);

  const fetchExams = () => {
    api.get('/exams')
      .then(res => setExams(res.data.exams))
      .catch(() => toast.error('Failed to load exams'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam profile?')) return;
    try {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter(e => e._id !== id));
      toast.success('Exam deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Exam Profiles</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your target exams and track per-exam progress</p>
        </div>
        <button onClick={() => { setEditExam(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Exam
        </button>
      </div>

      {/* Preset exams */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Quick Add — Popular Exams</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_EXAMS.map(p => (
            <button key={p.name} onClick={() => { setEditExam({ ...p, examDate: '', description: '', subjects: [] }); setShowModal(true); }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-left hover:border-blue-300 hover:shadow-md transition-all">
              <p className="font-bold text-blue-700 text-base">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{p.state}</p>
            </button>
          ))}
        </div>
      </div>

      {/* My exams */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-600 font-medium">No exam profiles yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your target exams to organize your preparation</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">My Exams ({exams.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(exam => (
              <div key={exam._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{exam.name}</h3>
                    {exam.fullName && <p className="text-sm text-gray-500">{exam.fullName}</p>}
                    {exam.state && exam.state !== 'National' && <p className="text-xs text-blue-600 mt-0.5">{exam.state}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditExam(exam); setShowModal(true); }}
                      className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 px-2 py-1 rounded-lg hover:border-blue-300">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(exam._id)}
                      className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-1 rounded-lg hover:border-red-300">
                      Delete
                    </button>
                  </div>
                </div>
                {exam.description && <p className="text-sm text-gray-600 mb-3">{exam.description}</p>}
                {exam.examDate && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                      📅 {new Date(exam.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.max(0, Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24)))} days left
                    </span>
                  </div>
                )}
                {exam.subjects?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {exam.subjects.slice(0, 5).map(s => (
                      <span key={s.name} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.name}</span>
                    ))}
                    {exam.subjects.length > 5 && <span className="text-xs text-gray-400">+{exam.subjects.length - 5} more</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <ExamModal
          initial={editExam}
          onClose={() => { setShowModal(false); setEditExam(null); }}
          onSaved={() => { setShowModal(false); setEditExam(null); fetchExams(); }}
        />
      )}
    </div>
  );
}

function ExamModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    fullName: initial?.fullName || '',
    state: initial?.state || 'National',
    examDate: initial?.examDate ? new Date(initial.examDate).toISOString().split('T')[0] : '',
    description: initial?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?._id) {
        await api.put(`/exams/${initial._id}`, form);
        toast.success('Exam updated!');
      } else {
        await api.post('/exams', form);
        toast.success('Exam added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save exam');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-lg">{initial?._id ? 'Edit Exam' : 'Add Exam Profile'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Short Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="UPSC" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="National" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Full official name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Date</label>
            <input type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400">
              {loading ? 'Saving...' : 'Save Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
