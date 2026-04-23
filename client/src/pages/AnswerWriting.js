import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function ScoreRing({ score }) {
  const pct = (score / 10) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }} />
        <text x="60" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill={color}>{score}</text>
        <text x="60" y="82" textAnchor="middle" fontSize="11" fill="#9ca3af">/10</text>
      </svg>
    </div>
  );
}

export default function AnswerWriting() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [answerId, setAnswerId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [startTime] = useState(Date.now());
  const pollRef = useRef(null);

  useEffect(() => {
    api.get(`/questions/${questionId}`)
      .then(res => setQuestion(res.data.question))
      .catch(() => toast.error('Question not found'))
      .finally(() => setLoading(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [questionId]);

  const pollEvaluation = (aid) => {
    setPolling(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/answers/${aid}`);
        if (res.data.answer.isEvaluated) {
          setEvaluation(res.data.answer.evaluation);
          setPolling(false);
          clearInterval(pollRef.current);
          toast.success('AI evaluation complete!');
        }
      } catch { /* ignore */ }
      if (attempts > 30) { setPolling(false); clearInterval(pollRef.current); }
    }, 3000);
  };

  const handleSubmit = async () => {
    const text = answerText.trim();
    if (text.length < 50) { toast.error('Please write at least 50 characters'); return; }
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const res = await api.post('/answers', { questionId, answerText: text, timeTaken });
      setAnswerId(res.data.answer._id);
      toast.success('Answer submitted! AI is evaluating...');
      pollEvaluation(res.data.answer._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluateNow = async () => {
    if (!answerId) return;
    setPolling(true);
    try {
      const res = await api.post(`/answers/${answerId}/evaluate`);
      setEvaluation(res.data.answer.evaluation);
      toast.success('Evaluation complete!');
    } catch {
      toast.error('Evaluation failed. Please try again.');
    } finally { setPolling(false); }
  };

  if (loading) return <PageLoader />;
  if (!question) return <div className="p-6 text-center text-gray-500">Question not found</div>;

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm mb-4 flex items-center gap-1">
        ← Back
      </button>

      {/* Question card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{question.subject}</span>
          {question.topic && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{question.topic}</span>}
          {question.year && <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">{question.year}</span>}
          <span className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full">{question.marks} marks</span>
        </div>
        <h2 className="text-gray-800 text-base leading-relaxed font-medium">{question.questionText}</h2>
      </div>

      {/* Writing area */}
      {!evaluation && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Your Answer</h3>
            <span className="text-xs text-gray-400">{wordCount} words</span>
          </div>
          <div className="p-4">
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              disabled={!!answerId}
              className="w-full min-h-64 text-sm text-gray-800 leading-relaxed focus:outline-none resize-none"
              placeholder="Write your answer here...

Tips for a good answer:
• Start with a strong introduction (2-3 sentences)
• Cover all aspects of the question with relevant facts
• Use appropriate keywords and technical terms
• Structure with clear paragraphs
• End with a balanced conclusion"
            />
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Aim for 200-400 words for a 10-mark answer</p>
            {!answerId ? (
              <button onClick={handleSubmit} disabled={submitting || wordCount < 10}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                {submitting ? 'Submitting...' : 'Submit for AI Evaluation →'}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Polling state */}
      {polling && !evaluation && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100 mb-5">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-medium text-gray-800">AI is evaluating your answer...</p>
          <p className="text-gray-400 text-sm mt-1">This may take 15-30 seconds</p>
          <button onClick={handleEvaluateNow} className="mt-4 text-blue-600 text-sm underline hover:text-blue-800">
            Evaluate now
          </button>
        </div>
      )}

      {/* Evaluation results */}
      {evaluation && (
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 text-lg mb-4 text-center">AI Evaluation</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreRing score={evaluation.score || 0} />
              <div className="flex-1">
                <div className="bg-blue-50 rounded-lg p-4 mb-3">
                  <p className="text-sm font-medium text-blue-800">Introduction</p>
                  <p className="text-sm text-blue-700 mt-1">{evaluation.introduction}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-800">Structure</p>
                  <p className="text-sm text-purple-700 mt-1">{evaluation.structure}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Coverage */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-3">📋 Content Coverage</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{evaluation.contentCoverage}</p>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <h4 className="font-medium text-green-800 mb-3">✅ Keywords Used</h4>
              <div className="flex flex-wrap gap-1.5">
                {(evaluation.keywordsUsed || []).map(kw => (
                  <span key={kw} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{kw}</span>
                ))}
                {(!evaluation.keywordsUsed || evaluation.keywordsUsed.length === 0) && (
                  <p className="text-green-600 text-sm">No specific keywords detected</p>
                )}
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
              <h4 className="font-medium text-red-800 mb-3">❌ Keywords Missed</h4>
              <div className="flex flex-wrap gap-1.5">
                {(evaluation.keywordsMissed || []).map(kw => (
                  <span key={kw} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{kw}</span>
                ))}
                {(!evaluation.keywordsMissed || evaluation.keywordsMissed.length === 0) && (
                  <p className="text-red-600 text-sm">Great coverage!</p>
                )}
              </div>
            </div>
          </div>

          {/* Improvements */}
          {evaluation.improvements?.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-3">🎯 Specific Improvements</h4>
              <ul className="space-y-2">
                {evaluation.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-blue-500 font-bold mt-0.5">{i + 1}.</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          {evaluation.encouragement && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
              <p className="text-sm opacity-80 mb-1">Mentor's Note</p>
              <p className="font-medium leading-relaxed">{evaluation.encouragement}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/my-answers')} className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              View All Answers
            </button>
            <button onClick={() => navigate('/questions')} className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
              Practice Another →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
