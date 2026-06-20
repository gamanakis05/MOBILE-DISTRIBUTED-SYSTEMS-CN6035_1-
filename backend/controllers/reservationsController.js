const reservationService = require('../services/reservationService');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * POST /reservations
 */
const createReservation = asyncHandler(async (req, res) => {
  const { showtimeId, items } = req.body;
  const userId = req.user.userId;
  console.log('🎫 Creating reservation for userId:', userId, 'req.user:', req.user);

  const reservation = await reservationService.createReservation(userId, { showtimeId, items });

  res.status(201).json({
    success: true,
    data: reservation
  });
});

/**
 * GET /reservations/:id
 */
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservationById(
    req.user.userId,
    req.user.role,
    req.params.id
  );

  res.json({
    success: true,
    data: reservation
  });
});

/**
 * DELETE /reservations/:id
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const result = await reservationService.cancelReservation(
    req.user.userId,
    req.user.role,
    req.params.id
  );

  res.json({
    success: true,
    ...result
  });
});

/**
 * GET /user/reservations
 */
const getUserReservations = asyncHandler(async (req, res) => {
  const reservations = await reservationService.getUserReservations(req.user.userId);

  res.json({
    success: true,
    data: reservations
  });
});

module.exports = {
  createReservation,
  getReservationById,
  cancelReservation,
  getUserReservations
};
