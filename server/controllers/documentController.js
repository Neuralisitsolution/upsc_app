const Document = require('../models/Document');
const Question = require('../models/Question');
const Syllabus = require('../models/Syllabus');
const { extractTextFromPDF } = require('../services/pdfService');
const { extractQuestionsFromPDF, analyzeTopperSheet, extractSyllabus } = require('../services/geminiService');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { documentType, examName, year, examId } = req.body;
    if (!documentType) return res.status(400).json({ message: 'Document type is required' });

    const doc = await Document.create({
      user: req.user._id,
      exam: examId || undefined,
      filename: req.file.filename,
      originalName: req.file.originalname,
      documentType,
      examName: examName || req.user.targetExam,
      year: year ? parseInt(year) : undefined,
      fileSize: req.file.size,
      filePath: req.file.path,
      processingStatus: 'Pending'
    });

    // Process asynchronously
    processDocument(doc, req.user).catch(console.error);

    res.status(201).json({ message: 'Document uploaded. Processing started.', document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function processDocument(doc, user) {
  try {
    await Document.findByIdAndUpdate(doc._id, { processingStatus: 'Processing' });
    const { text } = await extractTextFromPDF(doc.filePath);

    if (doc.documentType === 'PreviousYearPaper') {
      const questions = await extractQuestionsFromPDF(text, doc.examName, doc.year);
      if (questions.length > 0) {
        const questionDocs = questions.map(q => ({
          user: user._id,
          exam: doc.exam,
          examName: doc.examName,
          year: doc.year,
          subject: q.subject || 'General Studies',
          topic: q.topic || 'General',
          questionText: q.questionText,
          questionType: q.questionType || 'Essay',
          marks: q.marks || 10,
          difficulty: q.difficulty || 'Medium',
          keywords: q.keywords || [],
          sourceDocument: doc._id
        }));
        await Question.insertMany(questionDocs);
        await Document.findByIdAndUpdate(doc._id, {
          isProcessed: true,
          processingStatus: 'Completed',
          extractedQuestionsCount: questions.length
        });
      } else {
        await Document.findByIdAndUpdate(doc._id, { processingStatus: 'Completed', isProcessed: true });
      }
    } else if (doc.documentType === 'TopperAnswerSheet') {
      const analysis = await analyzeTopperSheet(text);
      await Document.findByIdAndUpdate(doc._id, {
        isProcessed: true,
        processingStatus: 'Completed',
        subjects: analysis?.subjectsFound || []
      });
    } else if (doc.documentType === 'Syllabus') {
      const subjects = await extractSyllabus(text, doc.examName);
      if (subjects.length > 0) {
        await Syllabus.findOneAndUpdate(
          { user: user._id, examName: doc.examName },
          { user: user._id, exam: doc.exam, examName: doc.examName, subjects, sourceDocument: doc._id },
          { upsert: true, new: true }
        );
      }
      await Document.findByIdAndUpdate(doc._id, { isProcessed: true, processingStatus: 'Completed' });
    } else {
      await Document.findByIdAndUpdate(doc._id, { isProcessed: true, processingStatus: 'Completed' });
    }
  } catch (err) {
    await Document.findByIdAndUpdate(doc._id, {
      processingStatus: 'Failed',
      processingError: err.message
    });
  }
}

exports.getDocuments = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.documentType = type;
    const docs = await Document.find(filter).sort('-uploadedAt');
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
