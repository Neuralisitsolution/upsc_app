const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  score: { type: Number, min: 0, max: 10 },
  introduction: String,
  contentCoverage: String,
  keywordsUsed: [String],
  keywordsMissed: [String],
  structure: String,
  improvements: [String],
  encouragement: String,
  topperComparison: String,
  rawFeedback: String
}, { _id: false });

const answerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: { type: String, required: true },
  evaluation: evaluationSchema,
  isEvaluated: { type: Boolean, default: false },
  timeTaken: { type: Number },
  wordCount: { type: Number },
  submittedAt: { type: Date, default: Date.now }
});

answerSchema.index({ user: 1, submittedAt: -1 });

module.exports = mongoose.model('Answer', answerSchema);
