const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { suggestDailyQuestion } = require('../services/geminiService');

exports.getQuestions = async (req, res) => {
  try {
    const { examName, subject, topic, year, difficulty, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (examName) filter.examName = { $regex: examName, $options: 'i' };
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (year) filter.year = parseInt(year);
    if (difficulty) filter.difficulty = difficulty;

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ questions, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, user: req.user._id });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { questionText, subject, topic, examName, year, questionType, marks, difficulty, keywords } = req.body;
    if (!questionText || !subject || !examName) {
      return res.status(400).json({ message: 'Question text, subject and exam name are required' });
    }
    const question = await Question.create({
      user: req.user._id,
      questionText, subject, topic, examName,
      year: year ? parseInt(year) : undefined,
      questionType, marks, difficulty,
      keywords: keywords || []
    });
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDailyQuestion = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today's daily question is already set
    let daily = await Question.findOne({
      user: req.user._id,
      isDaily: true,
      dailyDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!daily) {
      // Find all questions and pick a good one
      const answered = await Answer.find({ user: req.user._id }).distinct('question');
      const unanswered = await Question.find({
        user: req.user._id,
        _id: { $nin: answered }
      }).limit(50);

      const pool = unanswered.length > 0 ? unanswered : await Question.find({ user: req.user._id }).limit(50);

      if (pool.length === 0) {
        return res.json({ question: null, message: 'Upload question papers to get daily questions' });
      }

      const recentAnswers = await Answer.find({ user: req.user._id })
        .sort('-submittedAt').limit(5).populate('question');
      const recentSubjects = recentAnswers.map(a => a.question?.subject).filter(Boolean);

      const suggestion = await suggestDailyQuestion(pool, [], recentSubjects);
      const selectedId = suggestion?.recommendedId || pool[Math.floor(Math.random() * pool.length)]._id;

      await Question.findByIdAndUpdate(selectedId, { isDaily: true, dailyDate: today });
      daily = await Question.findById(selectedId);
    }

    res.json({ question: daily });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const subjectStats = await Question.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$subject', count: { $sum: 1 }, avgDifficulty: { $avg: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 3, { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 2, 1] }] } } } },
      { $sort: { count: -1 } }
    ]);

    const yearStats = await Question.aggregate([
      { $match: { user: userId, year: { $exists: true } } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const topicStats = await Question.aggregate([
      { $match: { user: userId } },
      { $group: { _id: { subject: '$subject', topic: '$topic' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ subjectStats, yearStats, topicStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
