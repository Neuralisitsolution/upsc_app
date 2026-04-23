const mongoose = require('mongoose');

const syllabusTopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['NotStarted', 'InProgress', 'Completed'], default: 'NotStarted' },
  completedAt: Date
}, { _id: false });

const syllabusSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weightage: { type: Number, default: 10 },
  topics: [syllabusTopicSchema]
}, { _id: false });

const syllabusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  examName: { type: String, required: true },
  subjects: [syllabusSubjectSchema],
  sourceDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  overallProgress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
