const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const reservationsController = require('../controllers/reservationsController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  validate
], userController.updateProfile);

router.get('/reservations', reservationsController.getUserReservations);

module.exports = router;
