const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dayNumber: { type: Number, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  estimatedHours: { type: Number, default: 2 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  notes: { type: String }
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  totalDays: { type: Number },
  hoursPerDay: { type: Number, default: 6 },
  plan: [dayPlanSchema],
  isActive: { type: Boolean, default: true },
  completionPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
