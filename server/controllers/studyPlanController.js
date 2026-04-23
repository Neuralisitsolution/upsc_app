const StudyPlan = require('../models/StudyPlan');
const Syllabus = require('../models/Syllabus');
const { generateStudyPlan } = require('../services/geminiService');

exports.generatePlan = async (req, res) => {
  try {
    const { examName, examDate, hoursPerDay, examId } = req.body;
    if (!examName || !examDate) {
      return res.status(400).json({ message: 'Exam name and exam date are required' });
    }

    const syllabus = await Syllabus.findOne({ user: req.user._id, examName });
    const subjects = syllabus?.subjects?.map(s => ({ name: s.name, topics: s.topics.map(t => t.name), weightage: s.weightage })) || [];

    if (subjects.length === 0) {
      subjects.push(
        { name: 'History', topics: ['Ancient India', 'Medieval India', 'Modern India', 'World History'], weightage: 15 },
        { name: 'Geography', topics: ['Physical Geography', 'Indian Geography', 'World Geography', 'Environment'], weightage: 12 },
        { name: 'Polity', topics: ['Constitution', 'Governance', 'Rights & Duties', 'Federal Structure'], weightage: 15 },
        { name: 'Economy', topics: ['Basics', 'Planning', 'Budget', 'Current Affairs'], weightage: 12 },
        { name: 'Science & Technology', topics: ['Physics', 'Chemistry', 'Biology', 'Space & Defense'], weightage: 10 },
        { name: 'Environment', topics: ['Ecology', 'Climate Change', 'Biodiversity', 'Conservation'], weightage: 8 },
        { name: 'Current Affairs', topics: ['National', 'International', 'Economy', 'S&T'], weightage: 15 }
      );
    }

    const planItems = await generateStudyPlan(subjects, examDate, hoursPerDay || req.user.studyHoursPerDay || 6);

    const startDate = new Date();
    const planDays = planItems.map((item, index) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      return { ...item, date, isCompleted: false };
    });

    // Deactivate old plans
    await StudyPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });

    const plan = await StudyPlan.create({
      user: req.user._id,
      exam: examId || undefined,
      examName,
      examDate: new Date(examDate),
      startDate,
      totalDays: planDays.length,
      hoursPerDay: hoursPerDay || 6,
      plan: planDays,
      isActive: true
    });

    res.status(201).json({ studyPlan: plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ user: req.user._id, isActive: true }).sort('-createdAt');
    res.json({ studyPlan: plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user._id }).sort('-createdAt');
    res.json({ studyPlans: plans });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markDayComplete = async (req, res) => {
  try {
    const { planId, dayNumber } = req.body;
    const plan = await StudyPlan.findOne({ _id: planId, user: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const dayIndex = plan.plan.findIndex(d => d.dayNumber === dayNumber);
    if (dayIndex === -1) return res.status(404).json({ message: 'Day not found in plan' });

    plan.plan[dayIndex].isCompleted = true;
    plan.plan[dayIndex].completedAt = new Date();

    const completedCount = plan.plan.filter(d => d.isCompleted).length;
    plan.completionPercentage = Math.round((completedCount / plan.plan.length) * 100);
    plan.updatedAt = new Date();
    await plan.save();

    res.json({ studyPlan: plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
