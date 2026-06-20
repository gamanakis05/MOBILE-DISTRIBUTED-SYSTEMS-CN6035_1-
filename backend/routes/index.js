const express = require('express');
const router = express.Router();

// Import sub-routers
const authRoutes        = require('./authRoutes');
const showRoutes        = require('./showRoutes');
const theatreRoutes     = require('./theatreRoutes');
const showtimeRoutes    = require('./showtimeRoutes');
const seatRoutes        = require('./seatRoutes');
const reservationRoutes = require('./reservationRoutes');
const userRoutes        = require('./userRoutes');
const adminRoutes       = require('./adminRoutes');

// Mount routes
router.use('/auth',         authRoutes);
router.use('/shows',        showRoutes);
router.use('/theatres',     theatreRoutes);
router.use('/showtimes',    showtimeRoutes);
router.use('/seats',        seatRoutes);
router.use('/reservations', reservationRoutes);
router.use('/user',         userRoutes);
router.use('/admin',        adminRoutes);

module.exports = router;
