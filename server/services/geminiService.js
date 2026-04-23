const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

async function extractQuestionsFromPDF(pdfText, examName, year) {
  const prompt = `You are an expert at analyzing exam papers. Extract all questions from this ${examName} ${year || ''} exam paper text.

PDF Text:
${pdfText.substring(0, 15000)}

Return a JSON array of questions with this exact structure (no markdown, pure JSON):
[
  {
    "questionText": "full question text here",
    "subject": "subject name (History/Geography/Polity/Economy/Science/Environment/Current Affairs/General Studies)",
    "topic": "specific topic within the subject",
    "questionType": "MCQ or Essay or Short",
    "marks": number (default 10),
    "difficulty": "Easy or Medium or Hard",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]

Extract as many questions as possible. Return only valid JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Gemini extraction error:', error.message);
    return [];
  }
}

async function evaluateAnswer(questionText, answerText, topperStyle = '') {
  const prompt = `You are a strict but helpful UPSC/APPSC exam mentor. Evaluate this answer.

Question: ${questionText}

Student Answer: ${answerText}

${topperStyle ? `Topper Reference Style: ${topperStyle}` : ''}

Provide evaluation as pure JSON (no markdown):
{
  "score": number out of 10,
  "introduction": "feedback on introduction quality",
  "contentCoverage": "what was covered and what important points were missed",
  "keywordsUsed": ["keyword1", "keyword2"],
  "keywordsMissed": ["keyword1", "keyword2"],
  "structure": "feedback on structure and presentation",
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "encouragement": "motivational closing line",
  "topperComparison": "how this compares to topper answer style"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Gemini evaluation error:', error.message);
    throw new Error('AI evaluation failed. Please try again.');
  }
}

async function analyzeTopperSheet(pdfText) {
  const prompt = `Analyze this topper/ranker answer sheet and extract writing patterns.

Text: ${pdfText.substring(0, 12000)}

Return pure JSON:
{
  "writingStyle": "description of writing style",
  "structurePattern": "how answers are structured",
  "keyPhrases": ["phrase1", "phrase2", "phrase3"],
  "introductionStyle": "how introductions are written",
  "conclusionStyle": "how conclusions are written",
  "keyStrengths": ["strength1", "strength2"],
  "sampleTemplate": "a template showing the writing pattern",
  "subjectsFound": ["subject1", "subject2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (error) {
    console.error('Gemini topper analysis error:', error.message);
    return null;
  }
}

async function extractSyllabus(pdfText, examName) {
  const prompt = `Extract the complete syllabus from this ${examName} exam syllabus document.

Text: ${pdfText.substring(0, 15000)}

Return pure JSON array of subjects with topics:
[
  {
    "name": "Subject Name",
    "weightage": estimated percentage weightage (number),
    "topics": [
      { "name": "Topic 1", "status": "NotStarted" },
      { "name": "Topic 2", "status": "NotStarted" }
    ]
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return [];
  } catch (error) {
    console.error('Gemini syllabus error:', error.message);
    return [];
  }
}

async function generateStudyPlan(subjects, examDate, hoursPerDay, weakTopics = []) {
  const startDate = new Date();
  const exam = new Date(examDate);
  const totalDays = Math.ceil((exam - startDate) / (1000 * 60 * 60 * 24));

  const prompt = `Create a day-wise study plan for exam preparation.

Subjects: ${JSON.stringify(subjects)}
Total Days Available: ${totalDays}
Study Hours Per Day: ${hoursPerDay}
Weak Topics (prioritize): ${JSON.stringify(weakTopics)}
Start Date: ${startDate.toISOString().split('T')[0]}

Return a pure JSON array with one entry per day (max 90 days):
[
  {
    "dayNumber": 1,
    "subject": "Subject Name",
    "topic": "Specific Topic",
    "estimatedHours": 2,
    "notes": "brief study tip for this topic"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return [];
  } catch (error) {
    console.error('Gemini study plan error:', error.message);
    return [];
  }
}

async function suggestDailyQuestion(questions, userWeakTopics, recentSubjects) {
  if (!questions || questions.length === 0) return null;

  const prompt = `Based on user's study progress, suggest which question to assign as today's daily question.

Available Questions (sample):
${JSON.stringify(questions.slice(0, 20).map(q => ({ id: q._id, subject: q.subject, topic: q.topic, difficulty: q.difficulty })))}

User's Weak Topics: ${JSON.stringify(userWeakTopics)}
Recently Studied Subjects: ${JSON.stringify(recentSubjects)}

Return pure JSON with the recommended question id:
{ "recommendedId": "question_id_here", "reason": "why this question was selected" }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { recommendedId: questions[0]._id, reason: 'Default selection' };
  } catch (error) {
    return { recommendedId: questions[0]._id, reason: 'Default selection' };
  }
}

module.exports = {
  extractQuestionsFromPDF,
  evaluateAnswer,
  analyzeTopperSheet,
  extractSyllabus,
  generateStudyPlan,
  suggestDailyQuestion
};
