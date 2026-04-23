const Syllabus = require('../models/Syllabus');

exports.getSyllabus = async (req, res) => {
  try {
    const { examName } = req.query;
    const filter = { user: req.user._id };
    if (examName) filter.examName = examName;
    const syllabi = await Syllabus.find(filter);
    res.json({ syllabi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTopicStatus = async (req, res) => {
  try {
    const { syllabusId, subjectName, topicName, status } = req.body;
    const syllabus = await Syllabus.findOne({ _id: syllabusId, user: req.user._id });
    if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });

    const subject = syllabus.subjects.find(s => s.name === subjectName);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const topic = subject.topics.find(t => t.name === topicName);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.status = status;
    if (status === 'Completed') topic.completedAt = new Date();

    // Recalculate overall progress
    let totalTopics = 0;
    let completedTopics = 0;
    syllabus.subjects.forEach(s => {
      s.topics.forEach(t => {
        totalTopics++;
        if (t.status === 'Completed') completedTopics++;
      });
    });
    syllabus.overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    syllabus.updatedAt = new Date();
    await syllabus.save();

    res.json({ syllabus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
