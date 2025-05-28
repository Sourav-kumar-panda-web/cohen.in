// routes/student.js
const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getStudentProfile
} = require('../controllers/studentControles');

// Register new student
router.post('/register', registerStudent);

// Student login
router.post('/login', loginStudent);

// Get student profile by ID
router.get('/profile/:id', getStudentProfile);

module.exports = router;
