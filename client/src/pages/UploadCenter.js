import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'PreviousYearPaper', label: 'Previous Year Paper', icon: '📄', desc: 'AI extracts and categorizes all questions' },
  { value: 'TopperAnswerSheet', label: 'Topper Answer Sheet', icon: '🏆', desc: 'AI analyzes writing style and patterns' },
  { value: 'Syllabus', label: 'Syllabus PDF', icon: '📋', desc: 'AI creates topic tracker from syllabus' },
  { value: 'StudyMaterial', label: 'Study Material', icon: '📚', desc: 'Upload notes and reference material' },
];

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export default function UploadCenter() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ documentType: 'PreviousYearPaper', examName: '', year: '' });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are supported'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('File size must be under 50MB'); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('pdf', file);
    fd.append('documentType', form.documentType);
    if (form.examName) fd.append('examName', form.examName);
    if (form.year) fd.append('year', form.year);

    try {
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('PDF uploaded! AI processing has started...');
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(docs => docs.filter(d => d._id !== id));
      toast.success('Document deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upload Center</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload PDFs — AI automatically extracts and processes content</p>
      </div>

      {/* Document type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {DOC_TYPES.map(t => (
          <button key={t.value} onClick={() => setForm({ ...form, documentType: t.value })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${form.documentType === t.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <span className="text-2xl block mb-2">{t.icon}</span>
            <p className={`text-sm font-semibold ${form.documentType === t.value ? 'text-blue-700' : 'text-gray-700'}`}>{t.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Metadata fields */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
            <input value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. UPSC, APPSC, TSPSC" />
          </div>
          {form.documentType === 'PreviousYearPaper' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 2023" min="1990" max="2030" />
            </div>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'}`}>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
        {uploading ? (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Uploading PDF...</p>
          </>
        ) : (
          <>
            <span className="text-5xl block mb-4">📤</span>
            <p className="text-gray-700 font-semibold text-lg">Drop PDF here or click to browse</p>
            <p className="text-gray-400 text-sm mt-2">PDF files only • Max 50MB</p>
            <p className="text-blue-600 text-sm mt-1 font-medium">AI will automatically extract and process content</p>
          </>
        )}
      </div>

      {/* Uploaded documents list */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Uploaded Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-400 text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{DOC_TYPES.find(t => t.value === doc.documentType)?.icon || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{doc.originalName}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-xs text-gray-500">{doc.documentType}</span>
                        {doc.examName && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 rounded">• {doc.examName}</span>}
                        {doc.year && <span className="text-xs bg-green-50 text-green-700 px-1.5 rounded">• {doc.year}</span>}
                        {doc.extractedQuestionsCount > 0 && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-1.5 rounded">• {doc.extractedQuestionsCount} questions extracted</span>
                        )}
                        <span className="text-xs text-gray-400">• {formatSize(doc.fileSize)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[doc.processingStatus]}`}>
                        {doc.processingStatus === 'Processing' && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></span>}
                        {doc.processingStatus}
                      </span>
                      <button onClick={() => handleDelete(doc._id)} className="text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
                    </div>
                  </div>
                  {doc.processingError && <p className="text-xs text-red-500 mt-1">Error: {doc.processingError}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`;
}
