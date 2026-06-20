const express = require('express');
const theatresController = require('../controllers/theatresController');

const router = express.Router();

router.get('/', theatresController.getTheatres);
router.get('/:id', theatresController.getTheatreById);

module.exports = router;
