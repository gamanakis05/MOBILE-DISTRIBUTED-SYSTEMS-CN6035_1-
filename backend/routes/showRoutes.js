const express = require('express');
const showsController = require('../controllers/showsController');

const router = express.Router();

/**
 * @route   GET /api/shows
 * @desc    Get all shows (with optional filtering by theatreId, title, date)
 * @access  Public
 */
router.get('/', showsController.getShows);

/**
 * @route   GET /api/shows/:id
 * @desc    Get show by ID
 * @access  Public
 */
router.get('/:id', showsController.getShowById);

module.exports = router;
