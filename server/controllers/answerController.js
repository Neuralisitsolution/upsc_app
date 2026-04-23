const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Document = require('../models/Document');
const { evaluateAnswer } = require('../services/geminiService');

exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText, timeTaken } = req.body;
    if (!questionId || !answerText) {
      return res.status(400).json({ message: 'Question ID and answer text are required' });
    }

    const question = await Question.findOne({ _id: questionId, user: req.user._id });
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const wordCount = answerText.trim().split(/\s+/).length;
    const answer = await Answer.create({
      user: req.user._id,
      question: questionId,
      answerText,
      wordCount,
      timeTaken: timeTaken || 0,
      isEvaluated: false
    });

    // Increment question attempt count
    await Question.findByIdAndUpdate(questionId, { $inc: { timesAttempted: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalAnswersWritten: 1, totalQuestionsAttempted: 1 } });

    // Evaluate asynchronously
    evaluateAnswerAsync(answer._id, question, answerText, req.user._id);

    res.status(201).json({ answer, message: 'Answer submitted. AI evaluation in progress...' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function evaluateAnswerAsync(answerId, question, answerText, userId) {
  try {
    // Try to find topper reference
    const topperDoc = await Document.findOne({ user: userId, documentType: 'TopperAnswerSheet', isProcessed: true });
    const topperStyle = topperDoc ? 'Use structured intro-body-conclusion format with relevant keywords' : '';

    const evaluation = await evaluateAnswer(question.questionText, answerText, topperStyle);
    if (evaluation) {
      await Answer.findByIdAndUpdate(answerId, { evaluation, isEvaluated: true });
    }
  } catch (err) {
    console.error('Async evaluation failed:', err.message);
  }
}

exports.evaluateAnswerNow = async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, user: req.user._id }).populate('question');
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    const evaluation = await evaluateAnswer(answer.question.questionText, answer.answerText);
    if (!evaluation) return res.status(500).json({ message: 'Evaluation failed. Please try again.' });

    answer.evaluation = evaluation;
    answer.isEvaluated = true;
    await answer.save();

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnswers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Answer.countDocuments({ user: req.user._id });
    const answers = await Answer.find({ user: req.user._id })
      .populate('question', 'questionText subject topic examName year')
      .sort('-submittedAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ answers, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnswer = async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, user: req.user._id })
      .populate('question');
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnswerStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalAnswers, weeklyAnswers, monthlyAnswers, avgScore, scoreBySubject, recentScores] = await Promise.all([
      Answer.countDocuments({ user: userId }),
      Answer.countDocuments({ user: userId, submittedAt: { $gte: sevenDaysAgo } }),
      Answer.countDocuments({ user: userId, submittedAt: { $gte: thirtyDaysAgo } }),
      Answer.aggregate([
        { $match: { user: userId, isEvaluated: true } },
        { $group: { _id: null, avg: { $avg: '$evaluation.score' } } }
      ]),
      Answer.aggregate([
        { $match: { user: userId, isEvaluated: true } },
        { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
        { $unwind: '$q' },
        { $group: { _id: '$q.subject', avgScore: { $avg: '$evaluation.score' }, count: { $sum: 1 } } },
        { $sort: { avgScore: 1 } }
      ]),
      Answer.find({ user: userId, isEvaluated: true })
        .sort('-submittedAt').limit(30)
        .select('evaluation.score submittedAt')
    ]);

    res.json({
      totalAnswers,
      weeklyAnswers,
      monthlyAnswers,
      averageScore: avgScore[0]?.avg?.toFixed(1) || 0,
      scoreBySubject,
      recentScores: recentScores.reverse().map(a => ({
        date: a.submittedAt,
        score: a.evaluation?.score || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
