const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  status: { type: String, enum: ['NotStarted', 'InProgress', 'Completed'], default: 'NotStarted' },
  completedAt: Date
}, { _id: false });

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  examName: { type: String },
  date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0) },
  answersWritten: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  subjectsStudied: [String],
  topicsProgress: [topicProgressSchema],
  studyMinutes: { type: Number, default: 0 },
  weeklyReport: {
    week: Number,
    year: Number,
    totalAnswers: Number,
    avgScore: Number,
    improvement: Number
  }
});

progressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
