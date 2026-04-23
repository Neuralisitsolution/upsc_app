const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  documentType: {
    type: String,
    enum: ['PreviousYearPaper', 'TopperAnswerSheet', 'Syllabus', 'StudyMaterial'],
    required: true
  },
  examName: { type: String },
  year: { type: Number },
  fileSize: { type: Number },
  filePath: { type: String, required: true },
  isProcessed: { type: Boolean, default: false },
  processingStatus: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed'], default: 'Pending' },
  processingError: { type: String },
  extractedQuestionsCount: { type: Number, default: 0 },
  subjects: [String],
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
