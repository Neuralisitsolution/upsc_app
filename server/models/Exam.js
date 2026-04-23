const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  fullName: { type: String },
  state: { type: String, default: 'National' },
  examDate: { type: Date },
  description: { type: String },
  subjects: [{ name: String, weightage: Number, totalTopics: Number }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);
