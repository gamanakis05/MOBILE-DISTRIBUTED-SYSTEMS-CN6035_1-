const express = require('express');
const showtimesController = require('../controllers/showtimesController');

const router = express.Router();

router.get('/', showtimesController.getShowtimes);
router.get('/:id', showtimesController.getShowtimeById);

module.exports = router;
