const express = require('express');
const router = express.Router();
const { updateProfile, deleteProfile, getEnrolledCourses } = require('../controllers/Profile');
const { authentication, isStudent } = require('../middleware/auth');

// Authenticated user routes
router.put('/updateProfile', authentication, updateProfile);
router.delete('/deleteProfile', authentication, deleteProfile);

module.exports = router;
