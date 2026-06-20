const express = require('express');
const seatsController = require('../controllers/seatsController');
const { query } = require('express-validator');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', [
  query('showtimeId').isInt({ min: 1 }).withMessage('Valid showtimeId required.'),
  validate
], seatsController.getSeatsByShowtime);

module.exports = router;
