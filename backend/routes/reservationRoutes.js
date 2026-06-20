const express = require('express');
const { body } = require('express-validator');
const reservationsController = require('../controllers/reservationsController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Apply authentication to all reservation routes
router.use(authenticate);

router.post('/', [
  body('showtimeId').isInt({ min: 1 }).withMessage('Valid showtimeId required.'),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array.'),
  body('items.*.categoryId').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  validate
], reservationsController.createReservation);

router.get('/:id', reservationsController.getReservationById);
router.delete('/:id', reservationsController.cancelReservation);

module.exports = router;
