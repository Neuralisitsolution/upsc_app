const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSyllabus, updateTopicStatus } = require('../controllers/syllabusController');

router.use(protect);
router.get('/', getSyllabus);
router.put('/topic', updateTopicStatus);

module.exports = router;
