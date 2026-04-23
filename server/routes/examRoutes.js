const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createExam, getExams, getExam, updateExam, deleteExam } = require('../controllers/examController');

router.use(protect);
router.post('/', createExam);
router.get('/', getExams);
router.get('/:id', getExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
