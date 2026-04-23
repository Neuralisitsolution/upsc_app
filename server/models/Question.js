const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  examName: { type: String, required: true },
  year: { type: Number },
  subject: { type: String, required: true },
  topic: { type: String },
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['MCQ', 'Short', 'Essay', 'Case Study'], default: 'Essay' },
  marks: { type: Number, default: 10 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  frequency: { type: Number, default: 1 },
  sourceDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  keywords: [String],
  isDaily: { type: Boolean, default: false },
  dailyDate: { type: Date },
  timesAttempted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

questionSchema.index({ examName: 1, subject: 1, topic: 1 });
questionSchema.index({ user: 1, isDaily: 1, dailyDate: 1 });

module.exports = mongoose.model('Question', questionSchema);
