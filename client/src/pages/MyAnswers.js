import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MyAnswers() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/answers', { params: { page, limit: 10 } })
      .then(res => { setAnswers(res.data.answers); setPages(res.data.pages); })
      .catch(() => toast.error('Failed to load answers'))
      .finally(() => setLoading(false));
  }, [page]);

  const scoreColor = (s) => !s ? 'text-gray-400' : s >= 7 ? 'text-green-600' : s >= 5 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = (s) => !s ? 'bg-gray-50' : s >= 7 ? 'bg-green-50' : s >= 5 ? 'bg-yellow-50' : 'bg-red-50';

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Answers</h1>
        <p className="text-gray-500 text-sm mt-0.5">Review your answer history and AI evaluations</p>
      </div>

      {answers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">✏️</p>
          <p className="text-gray-600 font-medium">No answers written yet</p>
          <button onClick={() => navigate('/questions')} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Start Answering Questions
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {answers.map(a => (
              <div key={a._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => setSelected(selected?._id === a._id ? null : a)}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${scoreBg(a.evaluation?.score)} flex flex-col items-center justify-center flex-shrink-0`}>
                      {a.isEvaluated ? (
                        <>
                          <span className={`text-xl font-bold ${scoreColor(a.evaluation?.score)}`}>{a.evaluation?.score}</span>
                          <span className="text-xs text-gray-400">/10</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 text-center">Pending</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {a.question?.subject && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{a.question.subject}</span>}
                        {a.question?.year && <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{a.question.year}</span>}
                        {a.wordCount && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{a.wordCount} words</span>}
                      </div>
                      <p className="text-sm text-gray-700 font-medium line-clamp-1">{a.question?.questionText}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(a.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-gray-300 text-sm">{selected?._id === a._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded evaluation */}
                {selected?._id === a._id && (
                  <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50 rounded-b-xl">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Your Answer</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-6">{a.answerText}</p>
                    </div>
                    {a.isEvaluated && a.evaluation ? (
                      <>
                        {a.evaluation.introduction && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Introduction Feedback</p>
                            <p className="text-sm text-blue-600">{a.evaluation.introduction}</p>
                          </div>
                        )}
                        {a.evaluation.contentCoverage && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Content Coverage</p>
                            <p className="text-sm text-gray-600">{a.evaluation.contentCoverage}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {a.evaluation.keywordsUsed?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-green-600 mb-1">✅ Keywords Used</p>
                              <div className="flex flex-wrap gap-1">{a.evaluation.keywordsUsed.map(k => <span key={k} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{k}</span>)}</div>
                            </div>
                          )}
                          {a.evaluation.keywordsMissed?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-red-600 mb-1">❌ Missed</p>
                              <div className="flex flex-wrap gap-1">{a.evaluation.keywordsMissed.map(k => <span key={k} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{k}</span>)}</div>
                            </div>
                          )}
                        </div>
                        {a.evaluation.improvements?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">🎯 Improvements</p>
                            <ul className="space-y-1">{a.evaluation.improvements.map((imp, i) => <li key={i} className="text-sm text-gray-600 flex gap-1"><span className="text-blue-500">{i + 1}.</span>{imp}</li>)}</ul>
                          </div>
                        )}
                        {a.evaluation.encouragement && (
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3 text-white">
                            <p className="text-sm">{a.evaluation.encouragement}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">Evaluation pending...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">← Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
