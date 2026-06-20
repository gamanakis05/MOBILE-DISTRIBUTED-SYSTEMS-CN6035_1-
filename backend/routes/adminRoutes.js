const express = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const admin = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', admin.getDashboardStats);

// Users
router.get('/users',         admin.getAllUsers);
router.get('/users/:id',     admin.getUserById);
router.put('/users/:id',     admin.updateUser);
router.delete('/users/:id',  admin.deleteUser);

// Reservations
router.get('/reservations',           admin.getAllReservations);
router.put('/reservations/:id',       admin.adminUpdateReservation);
router.delete('/reservations/:id',    admin.adminDeleteReservation);

// Theatres
router.post('/theatres',         admin.createTheatre);
router.put('/theatres/:id',      admin.updateTheatre);
router.delete('/theatres/:id',   admin.deleteTheatre);

// Shows
router.post('/shows',         admin.createShow);
router.put('/shows/:id',      admin.updateShow);
router.delete('/shows/:id',   admin.deleteShow);

// Showtimes
router.post('/showtimes',         admin.createShowtime);
router.put('/showtimes/:id',      admin.updateShowtime);
router.delete('/showtimes/:id',   admin.deleteShowtime);

module.exports = router;
