const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, targetExam } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, targetExam: targetExam || 'UPSC' });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, targetExam: user.targetExam }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (user.lastStudyDate) {
      const lastDate = new Date(user.lastStudyDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }
    user.lastStudyDate = today;
    await user.save();

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        targetExam: user.targetExam, currentStreak: user.currentStreak,
        longestStreak: user.longestStreak, totalAnswersWritten: user.totalAnswersWritten
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, targetExam, examDate, studyHoursPerDay } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (targetExam) updates.targetExam = targetExam;
    if (examDate) updates.examDate = examDate;
    if (studyHoursPerDay) updates.studyHoursPerDay = studyHoursPerDay;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
