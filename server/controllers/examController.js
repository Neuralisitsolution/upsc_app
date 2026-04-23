const Exam = require('../models/Exam');

exports.createExam = async (req, res) => {
  try {
    const { name, fullName, state, examDate, description, subjects } = req.body;
    if (!name) return res.status(400).json({ message: 'Exam name is required' });
    const exam = await Exam.create({
      user: req.user._id, name, fullName, state,
      examDate, description, subjects: subjects || []
    });
    res.status(201).json({ exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort('-createdAt');
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
